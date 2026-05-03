import os
from datetime import datetime, timezone
from flask import Flask, request, jsonify, send_from_directory
import joblib
import numpy as np
from pymongo import MongoClient
from pymongo.errors import PyMongoError
from dotenv import load_dotenv

HERE = os.path.dirname(__file__)
load_dotenv(os.path.join(HERE, ".env"), override=True)

MODEL_PATH = os.path.normpath(os.path.join(HERE, "stress_level_model_final.pkl"))
RECOMMENDATION_MODEL_PATH = os.path.normpath(os.path.join(HERE, "recommendation_model.pkl"))
RECOMMENDATION_ENCODER_PATH = os.path.normpath(os.path.join(HERE, "rec_label_encoder.pkl"))
MONGODB_URI = os.getenv("MONGODB_URI", "")
# Force the target database requested by user.
MONGODB_DB = "stress_predictions"
MONGODB_COLLECTION = os.getenv("MONGODB_COLLECTION", "predictions")
PORT = int(os.getenv("PORT", "5000"))

app = Flask(__name__, static_folder=os.path.normpath(os.path.join(HERE, "..", "frontend", "build")))

# Load model once at startup
model = joblib.load(MODEL_PATH)
recommendation_model = joblib.load(RECOMMENDATION_MODEL_PATH)
rec_label_encoder = joblib.load(RECOMMENDATION_ENCODER_PATH)


def get_recommendation(data):
    """Return a single (formatted) recommendation for the request payload.

    This helper keeps backwards compatibility with callers that expect a
    single recommendation string. Prefer using `get_recommendations` which
    returns ranked recommendations with confidence scores.
    """
    recs, confidence = get_recommendations(data, top_n=1)
    return (recs[0] if recs else "Unknown"), confidence


def format_recommendation(label: str) -> str:
    """Convert an internal label into a user-friendly sentence.

    Known mappings are expanded to clear guidance. Unknown labels are
    converted by replacing underscores and title-casing as a fallback.
    """
    mapping = {
        "improve_sleep": "Improve your sleep to at least 7–8 hours daily",
        "reduce_workload": "Reduce study overload and take regular breaks",
        "reduce_social_media": "Limit excessive social media usage",
        "maintain_balance": "Maintain a healthy study-life balance",
        "seek_support": "Talk to friends, family, or a counselor for support",
        "time_management": "Organize study time with a clear schedule and breaks",
    }

    if not label:
        return "No recommendation available"

    key = label.lower().strip()
    if key in mapping:
        return mapping[key]

    # Fallback: make label readable
    return key.replace("_", " ").strip().capitalize()


def get_recommendations(data, top_n=3):
    """Return the top N recommendation texts ordered by model confidence.

    Returns a tuple: (list_of_formatted_recommendations, top_confidence_float)
    where `top_confidence_float` is a value in [0.0, 1.0].
    """

    # Map input field `daily_study` (API) to `study_hours` (model)
    study_hours = data.get("daily_study", 0)
    recommendation_features = np.array([[
        data.get("sleep_hours", 0),
        study_hours,
        data.get("attendance", 0),
        data.get("social_media", 0),
    ]])

    # If model supports probabilities, use them to rank recommendations
    if hasattr(recommendation_model, "predict_proba"):
        try:
            probabilities = recommendation_model.predict_proba(recommendation_features)[0]
            # classes_ aligns with probabilities indices
            class_labels = np.array(recommendation_model.classes_)
            ranked_indices = np.argsort(probabilities)[::-1][:top_n]

            recommendations = []
            for idx in ranked_indices:
                encoded = class_labels[idx]
                try:
                    decoded = rec_label_encoder.inverse_transform([encoded])[0]
                except Exception:
                    decoded = str(encoded)

                recommendations.append((decoded, float(probabilities[idx])))

            # Format texts and extract scores
            formatted = [format_recommendation(r[0]) for r in recommendations]
            top_confidence = float(recommendations[0][1]) if recommendations else 0.0
            return formatted, top_confidence
        except Exception:
            # Fall through to a safe single-prediction fallback
            pass

    # Fallback: use predict() when predict_proba is not available
    try:
        pred = recommendation_model.predict(recommendation_features)[0]
        try:
            decoded = rec_label_encoder.inverse_transform([pred])[0]
        except Exception:
            decoded = str(pred)
        return [format_recommendation(decoded)], 0.0
    except Exception:
        return ["No recommendation available"], 0.0

# Initialize MongoDB client if URI is configured.
mongo_collection = None
if MONGODB_URI:
    try:
        mongo_client = MongoClient(MONGODB_URI, serverSelectionTimeoutMS=3000)
        mongo_client.admin.command("ping")
        mongo_collection = mongo_client[MONGODB_DB][MONGODB_COLLECTION]
        print(f"MongoDB connected: {MONGODB_DB}.{MONGODB_COLLECTION}")
    except Exception as e:
        print(f"MongoDB connection failed: {e}")
        mongo_collection = None


@app.after_request
def add_cors_headers(response):
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type"
    return response


@app.route("/api/predict", methods=["POST"])
def predict():
    data = request.get_json() or {}

    # Validate required inputs for recommendation model
    required = ["sleep_hours", "daily_study", "attendance", "social_media"]
    missing = [f for f in required if f not in data]
    if missing:
        return (
            jsonify({"error": "missing required fields", "missing": missing}),
            400,
        )

    # Build feature array for model prediction
    features = np.array([[
        data.get("term_mark_avg", 0),
        data.get("prev_term_mark_avg", 0),
        data.get("daily_study", 0),
        data.get("prefer_study", 0),
        data.get("travel_time", 0),
        data.get("financial_status", 0),
        data.get("social_media", 0),
        data.get("sleep_hours", 0),
        data.get("attendance", 0),
        data.get("tuition_hours_per_week", 0),
        data.get("disaster_impact", 0),
    ]])

    try:
        pred = model.predict(features)[0]
    except Exception as e:
        return jsonify({"error": f"prediction failed: {e}"}), 500

    try:
        recommendations, confidence = get_recommendations(data, top_n=3)
    except Exception as e:
        return jsonify({"error": f"recommendation failed: {e}"}), 500

    recommendation = recommendations[0] if recommendations else "Unknown"

    labels = {0: "Good", 1: "Bad", 2: "Awful"}
    stress_level = labels.get(int(pred), "Unknown")

    saved = False
    save_error = None
    if mongo_collection is not None:
        try:
            doc = {
                "created_at": datetime.now(timezone.utc),
                "input": {
                    "term_mark_avg": data.get("term_mark_avg", 0),
                    "prev_term_mark_avg": data.get("prev_term_mark_avg", 0),
                    "daily_study": data.get("daily_study", 0),
                    "prefer_study": data.get("prefer_study", 0),
                    "travel_time": data.get("travel_time", 0),
                    "financial_status": data.get("financial_status", 0),
                    "social_media": data.get("social_media", 0),
                    "sleep_hours": data.get("sleep_hours", 0),
                    "attendance": data.get("attendance", 0),
                    "tuition_hours_per_week": data.get("tuition_hours_per_week", 0),
                    "disaster_impact": data.get("disaster_impact", 0),
                },
                "prediction": {
                    "stress_level": stress_level,
                    "recommendation": recommendation,
                    "recommendations": recommendations,
                    "confidence": float(confidence),
                    "class_id": int(pred),
                },
            }
            mongo_collection.insert_one(doc)
            saved = True
        except PyMongoError as e:
            save_error = str(e)

    response = {
        "stress_level": stress_level,
        "recommendation": recommendation,
        "recommendations": recommendations,
        "confidence": float(confidence),
        "saved": saved,
        "db": MONGODB_DB,
        "collection": MONGODB_COLLECTION,
    }
    if save_error:
        response["save_error"] = "Prediction generated, but failed to save to MongoDB"

    return jsonify(response)


@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_frontend(path):
    # Serve React build if present, otherwise mostrar simple message
    build_dir = app.static_folder
    if path != "" and os.path.exists(os.path.join(build_dir, path)):
        return send_from_directory(build_dir, path)
    index_path = os.path.join(build_dir, 'index.html')
    if os.path.exists(index_path):
        return send_from_directory(build_dir, 'index.html')
    return "Frontend build not found. Run `npm run build` in the frontend folder.", 200


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=PORT)

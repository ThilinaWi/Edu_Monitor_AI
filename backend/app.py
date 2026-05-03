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
MONGODB_URI = os.getenv("MONGODB_URI", "")
# Force the target database requested by user.
MONGODB_DB = "stress_predictions"
MONGODB_COLLECTION = os.getenv("MONGODB_COLLECTION", "predictions")
PORT = int(os.getenv("PORT", "5000"))

app = Flask(__name__, static_folder=os.path.normpath(os.path.join(HERE, "..", "frontend", "build")))

# Load model once at startup
model = joblib.load(MODEL_PATH)

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
                    "class_id": int(pred),
                },
            }
            mongo_collection.insert_one(doc)
            saved = True
        except PyMongoError as e:
            save_error = str(e)

    response = {
        "stress_level": stress_level,
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

import os
from flask import Flask, request, jsonify, send_from_directory
import joblib
import numpy as np

HERE = os.path.dirname(__file__)
MODEL_PATH = os.path.normpath(os.path.join(HERE, "stress_level_model_final.pkl"))

app = Flask(__name__, static_folder=os.path.normpath(os.path.join(HERE, "..", "frontend", "build")))

# Load model once at startup
model = joblib.load(MODEL_PATH)


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
    ]])

    try:
        pred = model.predict(features)[0]
    except Exception as e:
        return jsonify({"error": f"prediction failed: {e}"}), 500

    labels = {0: "Good", 1: "Bad", 2: "Awful"}
    return jsonify({"stress_level": labels.get(int(pred), "Unknown")})


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
    app.run(host='0.0.0.0', port=5000)

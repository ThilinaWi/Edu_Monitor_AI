from flask import Flask, request, jsonify
import joblib
import numpy as np

app = Flask(__name__)
model = joblib.load("stress_level_model_final.pkl")

@app.route("/predict", methods=["POST"])
def predict():
    data = request.json

    features = np.array([[
        data["term_mark_avg"],
        data["prev_term_mark_avg"],
        data["daily_study"],
        data["prefer_study"],
        data["travel_time"],
        data["financial_status"],
        data["social_media"],
        data["sleep_hours"],
        data["attendance"],
        data["tuition_hours_per_week"],
        data.get("disaster_impact", 0)
    ]])

    pred = model.predict(features)[0]
    labels = {0:"Good",1:"Bad",2:"Awful"}

    return jsonify({"stress_level": labels[int(pred)]})

if __name__ == "__main__":
    app.run(port=5001)

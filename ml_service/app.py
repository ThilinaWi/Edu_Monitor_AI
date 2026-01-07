# from flask import Flask, request, jsonify
# import joblib
# import numpy as np
# from google import genai
# from google.genai import types
# import os
# from dotenv import load_dotenv

# # Load environment variables
# load_dotenv()

# # Configure Gemini AI
# GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
# if GEMINI_API_KEY:
#     client = genai.Client(api_key=GEMINI_API_KEY)
#     gemini_model = "gemini-2.5-flash"
# else:
#     client = None
#     gemini_model = None
#     print("Warning: GEMINI_API_KEY not found. AI recommendations will not be available.")

# app = Flask(__name__)
# model = joblib.load("stress_level_model_final.pkl")

# def generate_ai_recommendations_with_gemini(data, stress_level):
#     """
#     Generate AI-powered recommendations using Google Gemini
#     PRIVACY-FIRST: Only sends aggregated/anonymized data categories
#     """
#     if not client:
#         return ["AI service unavailable. Please configure GEMINI_API_KEY in .env file."]
    
#     try:
#         # PRIVACY PROTECTION: Categorize data instead of sending exact values
#         def categorize_performance(avg):
#             if avg >= 75: return "excellent"
#             elif avg >= 60: return "good"
#             elif avg >= 50: return "fair"
#             else: return "needs improvement"
        
#         def categorize_sleep(hours):
#             if hours >= 7: return "adequate"
#             elif hours >= 5: return "insufficient"
#             else: return "severely insufficient"
        
#         def categorize_attendance(pct):
#             if pct >= 85: return "excellent"
#             elif pct >= 75: return "good"
#             elif pct >= 60: return "poor"
#             else: return "critical"
        
#         # Anonymized prompt - NO EXACT NUMBERS SENT TO GOOGLE
#         prompt = f"""You are an AI student wellbeing advisor.

# PRIVACY NOTE: This is anonymized educational data only.
# Do NOT provide medical diagnosis or treatment.

# Student Profile (ANONYMIZED):
# • Overall Stress Level: {stress_level}
# • Academic Performance: {categorize_performance(data['term_mark_avg'])}
# • Performance Trend: {'improving' if data['term_mark_avg'] > data['prev_term_mark_avg'] else 'declining' if data['term_mark_avg'] < data['prev_term_mark_avg'] else 'stable'}
# • Sleep Quality: {categorize_sleep(data['sleep_hours'])}
# • Class Attendance: {categorize_attendance(data['attendance'])}
# • Social Media Usage: {'high' if data['social_media'] >= 3 else 'moderate' if data['social_media'] >= 1.5 else 'low'}
# • Study Commitment: {'high' if data['daily_study'] >= 4 else 'moderate' if data['daily_study'] >= 2 else 'low'}
# • Workload Pressure: {'high' if data['tuition_hours_per_week'] > 10 else 'moderate' if data['tuition_hours_per_week'] >= 5 else 'light'}
# • External Stressors: {'significant' if data['disaster_impact'] >= 3 or data['financial_status'] == 1 else 'minimal'}

# Based on this profile, provide:
# • Safe and practical stress management tips
# • Healthy sleep and study routine guidance
# • Lifestyle improvement suggestions
# • Advice on when to seek professional support (educational only)

# Provide exactly 5 SHORT and actionable recommendations.
# IMPORTANT: Keep each recommendation to 1-2 sentences MAXIMUM (20-30 words each).
# Do NOT use emojis.
# Be concise and direct.
# Include a brief safety disclaimer at the end (1 sentence).

# Format:
# 1. [Short recommendation - max 2 sentences]
# 2. [Short recommendation - max 2 sentences]
# 3. [Short recommendation - max 2 sentences]
# 4. [Short recommendation - max 2 sentences]
# 5. [Short recommendation - max 2 sentences]

# Safety Disclaimer: [One sentence disclaimer]
# """
        
#         response = client.models.generate_content(
#             model=gemini_model,
#             contents=prompt
#         )
        
#         # Parse response into list
#         recommendations_text = response.text.strip()
#         recommendations = []
        
#         for line in recommendations_text.split('\n'):
#             line = line.strip()
#             # Accept bullet points (•, -, *) OR numbered lists (1., 2., etc)
#             if line.startswith('•') or line.startswith('-') or line.startswith('*') or (len(line) > 2 and line[0].isdigit() and line[1] == '.'):
#                 # Remove bullet/number and add to list
#                 if line[0].isdigit():
#                     rec = line.split('.', 1)[1].strip()  # Remove "1. " format
#                 else:
#                     rec = line.lstrip('•-* ').strip()  # Remove bullet format
#                 if rec and not rec.startswith('Safety') and not rec.startswith('Disclaimer'):
#                     recommendations.append(rec)
        
#         # If we got good recommendations, return them
#         if len(recommendations) >= 3:  # More lenient - accept 3+ recommendations
#             return recommendations[:5]  # Return max 5
#         else:
#             # Return generic message if parsing failed
#             return ["AI response format error. Please try again."]
            
#     except Exception as e:
#         print(f"Gemini API Error: {e}")
#         # Return helpful fallback when quota is exhausted
#         if "429" in str(e) or "RESOURCE_EXHAUSTED" in str(e) or "quota" in str(e).lower():
#             return [
#                 "Gemini API quota exhausted for today. Your stress prediction is still available above.",
#                 "Daily free quota: 20 requests. Resets at midnight Pacific Time.",
#                 "You can still use stress history graph and breathing exercise features.",
#                 "For unlimited AI recommendations, consider upgrading to paid tier at ai.google.dev",
#                 "General tip: Maintain 7-9 hours of sleep and take regular study breaks."
#             ]
#         return [
#             "AI service temporarily unavailable. Your stress prediction is still shown above.",
#             "Please try again later or contact support if the issue persists."
#         ]

# @app.route("/predict", methods=["POST"])
# def predict():
#     data = request.json

#     features = np.array([[
#         data["term_mark_avg"],
#         data["prev_term_mark_avg"],
#         data["daily_study"],
#         data["prefer_study"],
#         data["travel_time"],
#         data["financial_status"],
#         data["social_media"],
#         data["sleep_hours"],
#         data["attendance"],
#         data["tuition_hours_per_week"],
#         data["disaster_impact"]
#     ]])

#     pred = model.predict(features)[0]
#     labels = {0:"Good", 1:"Bad", 2:"Awful"}
#     stress_level = labels[int(pred)]
    
#     # Generate AI-powered recommendations
#     ai_recommendations = generate_ai_recommendations_with_gemini(data, stress_level)

#     return jsonify({
#         "stress_level": stress_level,
#         "prediction_code": int(pred),
#         "ai_recommendations": ai_recommendations,
#         "main_causes": [],  # Can add feature importance here if needed
#         "ai_powered": client is not None
#     })

# if __name__ == "__main__":
#     app.run(port=5001)
from flask import Flask, request, jsonify
import joblib
import numpy as np
import os
from dotenv import load_dotenv
from google import genai

# -------------------- CONFIG --------------------

load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if GEMINI_API_KEY:
    client = genai.Client(api_key=GEMINI_API_KEY)
    GEMINI_MODEL = "gemini-2.5-flash"
else:
    client = None
    GEMINI_MODEL = None
    print("⚠ GEMINI_API_KEY not found – AI recommendations disabled")

app = Flask(__name__)
model = joblib.load("stress_level_model_final.pkl")

# -------------------- MAIN CAUSE DETECTOR --------------------

def detect_main_causes(data):
    causes = []

    if data["sleep_hours"] < 6:
        causes.append("Sleep deprivation")
    if data["attendance"] < 70:
        causes.append("Low attendance")
    if data["social_media"] > 2:
        causes.append("High social media usage")
    if data["tuition_hours_per_week"] > 10:
        causes.append("Tuition overload")
    if data["travel_time"] > 3:
        causes.append("High daily travel fatigue")
    if data["financial_status"] == 1:
        causes.append("Financial stress")
    if data["disaster_impact"] >= 3:
        causes.append("External disaster stress")

    return causes

# -------------------- GEMINI AI ENGINE --------------------

def generate_ai_recommendations(data, stress_level):
    if not client:
        return ["AI service unavailable. Please configure GEMINI_API_KEY."]

    main_causes = detect_main_causes(data)

    def cat_sleep(h): return "adequate" if h >= 7 else "insufficient" if h >= 5 else "severely insufficient"
    def cat_att(a): return "excellent" if a >= 85 else "good" if a >= 75 else "poor" if a >= 60 else "critical"
    def cat_perf(p): return "excellent" if p >= 75 else "good" if p >= 60 else "fair" if p >= 50 else "weak"

    prompt = f"""
You are an AI student wellbeing advisor.

This data is anonymized and educational only. Do NOT provide medical diagnosis.

Student Profile:
Stress Level: {stress_level}
Academic Performance: {cat_perf(data['term_mark_avg'])}
Sleep Quality: {cat_sleep(data['sleep_hours'])}
Attendance: {cat_att(data['attendance'])}
Social Media Usage: {"high" if data['social_media'] > 2 else "moderate" if data['social_media'] >= 1 else "low"}
Workload Pressure: {"high" if data['tuition_hours_per_week'] > 10 else "moderate" if data['tuition_hours_per_week'] >= 5 else "light"}
Main Stress Causes: {', '.join(main_causes) if main_causes else 'No major risk factors'}

Provide exactly 5 short personalized recommendations.
Each max 20–30 words.
End with one sentence safety disclaimer.
"""

    response = client.models.generate_content(model=GEMINI_MODEL, contents=prompt)

    lines = response.text.strip().split("\n")
    tips = []

    for line in lines:
        line = line.strip()
        if line and line[0].isdigit():
            tips.append(line.split('.', 1)[1].strip())

    return tips[:5]

# -------------------- API --------------------

@app.route("/predict", methods=["POST"])
def predict():
    data = request.json

    features = np.array([[ 
        data["term_mark_avg"], data["prev_term_mark_avg"], data["daily_study"],
        data["prefer_study"], data["travel_time"], data["financial_status"],
        data["social_media"], data["sleep_hours"], data["attendance"],
        data["tuition_hours_per_week"], data["disaster_impact"]
    ]])

    pred = int(model.predict(features)[0])
    labels = {0:"Low Risk", 1:"Moderate Risk", 2:"High Risk"}

    causes = detect_main_causes(data)
    recommendations = generate_ai_recommendations(data, labels[pred])

    return jsonify({
        "stress_level": labels[pred],
        "main_causes": causes,
        "ai_recommendations": recommendations,
        "ai_powered": client is not None
    })

# -------------------- RUN --------------------

if __name__ == "__main__":
    app.run(port=5001)

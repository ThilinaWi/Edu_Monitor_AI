# Edu Monitor AI – Stress Level Predictor

A web application that predicts student stress levels based on academic and lifestyle factors using machine learning.

## Project Structure

```
Edu_Monitor_AI/
├── backend/              # Flask backend (merged ML service)
│   ├── app.py           # Flask API + model prediction
│   ├── stress_level_model_final.pkl  # Trained ML model
│   └── README.md        # Backend-specific docs
├── frontend/            # React frontend
│   ├── src/
│   │   ├── App.js       # Main React component
│   │   └── ...
│   └── package.json
└── README.md           # This file
```

## Prerequisites

- **Python 3.8+** (with venv or conda activated)
- **Node.js 14+** and npm
- **Dependencies installed:**
  - Backend: Flask, joblib, numpy, scikit-learn, requests
  - Frontend: React, axios

## Quick Start

### 1. Set up Python environment

From the project root:

```bash
# Create and activate virtual environment (if not already done)
python -m venv .venv

# Windows
.venv\Scripts\activate

# macOS/Linux
source .venv/bin/activate
```

### 2. Install backend dependencies

```bash
pip install flask joblib numpy scikit-learn requests
```

### 3. Install frontend dependencies

```bash
cd frontend
npm install
cd ..
```

## Running the Application

### Option A: Flask backend serves frontend (Production-ready)

1. **Build the frontend:**
   ```bash
   cd frontend
   npm run build
   cd ..
   ```

2. **Start Flask backend:**
   ```bash
   cd backend
   python app.py
   ```
   
   Flask will serve the React build at `http://127.0.0.1:5000`

### Option B: Frontend dev server + Flask backend (Development)

**Terminal 1 – Flask backend:**
```bash
cd backend
python app.py
```

**Terminal 2 – React dev server:**
```bash
cd frontend
npm start
```

Then open `http://localhost:3000` in your browser. React will proxy API calls to Flask on `http://localhost:5000/api/predict`.

## API Endpoints

### POST `/api/predict`

Predicts student stress level based on input features.

**Request body:**
```json
{
  "term_mark_avg": 70,
  "prev_term_mark_avg": 68,
  "daily_study": 3,
  "prefer_study": 2,
  "travel_time": 1,
  "financial_status": 3,
  "social_media": 2,
  "sleep_hours": 7,
  "attendance": 90,
  "tuition_hours_per_week": 4
}
```

**Response:**
```json
{
  "stress_level": "Good"
}
```

Possible values: `Good` (Low Risk), `Bad` (Moderate Risk), `Awful` (High Risk)

## Testing

### Quick curl test (requires backend running on port 5000):

```bash
curl -X POST http://127.0.0.1:5000/api/predict \
  -H "Content-Type: application/json" \
  -d '{"term_mark_avg":60,"prev_term_mark_avg":58,"daily_study":2,"prefer_study":2,"travel_time":1,"financial_status":2,"social_media":1,"sleep_hours":6,"attendance":80,"tuition_hours_per_week":3}'
```

Expected response: `{"stress_level":"Good"}`

## Frontend Form Fields

The web form collects 10 fields from the user:

1. **term_mark_avg** – Current term average marks (0–100)
2. **prev_term_mark_avg** – Previous term average marks (0–100)
3. **daily_study** – Daily study hours (0–12+)
4. **prefer_study** – Preferred study time (0–3, where 0=morning, 1=afternoon, 2=evening, 3=night)
5. **travel_time** – Travel time to school/college (0–4+ hours)
6. **financial_status** – Financial situation (0–3, where 0=very comfortable, 1=comfortable, 2=financial strain, 3=severe strain)
7. **social_media** – Daily social media usage (0–4 hours)
8. **sleep_hours** – Average sleep hours (0–12)
9. **attendance** – Class attendance percentage (0–100)
10. **tuition_hours_per_week** – Weekly tuition hours (0–30+)

Based on predictions, the app provides personalized stress-management tips.

## Troubleshooting

### Backend won't start
- Ensure Python environment is activated: `.venv\Scripts\activate` (Windows) or `source .venv/bin/activate` (macOS/Linux)
- Check all dependencies are installed: `pip install -r requirements.txt`
- Verify port 5000 is not in use by another process

### Frontend won't load
- Ensure backend is running on `http://localhost:5000`
- Run `npm install` in the frontend folder if dependencies are missing
- Clear browser cache if styles/assets don't load

### Model loading error
- Verify `backend/stress_level_model_final.pkl` exists
- Scikit-learn version mismatch warnings are safe to ignore

## License

Internal use only.

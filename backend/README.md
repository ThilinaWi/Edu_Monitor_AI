Backend converted to Flask

How to run (development):

1. Ensure Python virtualenv is active and dependencies installed (`flask`, `joblib`, `numpy`).

2. From repository root run:

```powershell
Set-Location backend
python app.py
```

This starts a single Flask process on port `5000` that serves the frontend `build/` (if present) and exposes `/api/predict`.

If you prefer serving the frontend via React dev server during development, run `npm start` in `frontend/` instead and point it to `http://localhost:5000/api/predict`.

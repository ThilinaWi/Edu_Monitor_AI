Backend converted to Flask

How to run (development):

1. Ensure Python virtualenv is active and install dependencies:

```powershell
Set-Location backend
pip install -r requirements.txt
```

2. Configure environment variables (optional, for MongoDB logging):

```powershell
Copy-Item .env.example .env
```

Then edit `.env` and set `MONGODB_URI`.

3. Start backend:

```powershell
Set-Location backend
python app.py
```

This starts Flask on `PORT` (default `5000`) and exposes `/api/predict`.

MongoDB logging:
- If `MONGODB_URI` is set and connection succeeds, each prediction request is saved.
- Saved document fields: `created_at`, `input`, `prediction`.

If you prefer serving the frontend via React dev server during development, run `npm start` in `frontend/` and keep API calls at `http://localhost:5000/api/predict`.

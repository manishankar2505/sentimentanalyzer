@echo off
echo ===================================================
echo Starting Sentiment Analyzer (Full-Stack + AI)...
echo ===================================================

start "Sentiment Backend (FastAPI / Uvicorn)" cmd /k "cd backend && python -m uvicorn main:app --reload --port 5000"
start "Sentiment Frontend (React / Vite)" cmd /k "cd frontend && npm run dev"

echo.
echo Both servers started!
echo Backend (FastAPI):  http://localhost:5000
echo Frontend (React):    http://localhost:3000
echo ===================================================

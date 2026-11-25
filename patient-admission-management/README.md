# Patient Admission Management App

A responsive React frontend with a Python FastAPI backend and SQLite persistence. Built to match the DScribe Round 1 task.

## Stack
- Frontend: React.js + Vite
- Backend: Python + FastAPI
- Database: SQLite (the `patients.db` file is created automatically and persists after server restart)

## Requirements
- Python 3.10+
- Node.js 18+ and npm

## Run locally

### 1. Start the backend
```bash
cd backend
python -m venv .venv
# Windows: .venv\\Scripts\\activate
# macOS/Linux:
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload
```
Backend: http://localhost:8000  
Interactive API docs: http://localhost:8000/docs

### 2. Start the frontend (in a second terminal)
```bash
cd frontend
npm install
npm run dev
```
Frontend: http://localhost:5173

The frontend calls `http://localhost:8000` by default. To use a deployed API, create `frontend/.env`:
```env
VITE_API_URL=https://your-backend-domain.example
```
Restart the Vite server after changing the environment variable.

## Features
- Add, list, search and edit patients
- Filter by ward, department and doctor
- Delete with browser confirmation
- Mark admitted patients as discharged
- Responsive layout for mobile, tablet and desktop
- Client-side and backend validation
- SQLite data persists across backend restarts

## Validation
The frontend validates required values, letters-only names, age 0–120, and non-future admission dates before submitting. The backend independently validates the same rules and verifies that dropdown values belong to the configured lists. Invalid API requests receive a clear validation response.

## API endpoints
| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/patients` | List patients; supports `search`, `ward`, `department`, `doctor` query parameters |
| POST | `/api/patients` | Add patient |
| PUT | `/api/patients/{id}` | Update patient |
| PATCH | `/api/patients/{id}/discharge` | Mark discharged |
| DELETE | `/api/patients/{id}` | Delete patient |

## Notes before submission
- The task asks for a public GitHub repository and a live working URL. This source code is a local starter; you still need to push it to your own public GitHub repository and deploy both services.
- Deploy the backend and frontend separately. Configure the backend CORS `allow_origins` with your deployed frontend URL (or use a carefully configured environment variable), then set the frontend `VITE_API_URL` to the deployed backend URL.
- The doctor/ward/department choices are sample lists because the task document does not specify exact options. Keep the same options in `frontend/src/App.jsx` and `backend/schemas.py`.
- No login/signup is included, as the task says it is not required.

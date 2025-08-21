# BudgetTrackr Backend (FastAPI + SQLite)

This is an optional backend for BudgetTrackr providing REST APIs for budgets, categories, and settings. Uses FastAPI with SQLite storage.

## Endpoints

- GET    /api/health
- GET    /api/budgets
- POST   /api/budgets
- PUT    /api/budgets/{id}
- DELETE /api/budgets/{id}
- GET    /api/categories
- POST   /api/categories
- DELETE /api/categories/{name}
- GET    /api/settings
- PUT    /api/settings

## Requirements

- Python 3.10+

## Setup

```bash
cd backend
python -m venv .venv
# Windows PowerShell
. .venv/Scripts/Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 4000
```

SQLite file is created at `backend/budgettrackr.db`.

## CORS

CORS is permissive for common localhost origins. Adjust in `app/main.py` for production.

## Data Model

- Budget: id (str), name, amount, currency, category, description?, budgetDate, effectiveDate, createdAt, updatedAt
- Category: name (str)
- Settings: id=1, defaultCurrency, theme

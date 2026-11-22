# AI Fish Image Classifier

AI-powered fish image classification web application using a custom CNN model.

## Quick Start (Backend)

```bash
cd backend
python -m venv .venv
# Windows:
.venv\Scripts\activate
# Linux/Mac:
source .venv/bin/activate

pip install -r requirements.txt
# or for development:
pip install -r requirements-dev.txt

# Run database migrations
alembic upgrade head

# Start dev server
uvicorn app.main:app --reload
```

API documentation available at `http://localhost:8000/docs`.

## Project Structure

```
├── backend/          # FastAPI backend + TensorFlow inference
│   ├── app/          # Application code
│   ├── models/       # ML model artifacts
│   ├── tests/        # pytest test suite
│   └── alembic/      # Database migrations
├── frontend/         # React + Vite (Brief 02)
└── docs/             # Audit report, manifest
```

## Stack

- **Backend:** Python 3.12 + FastAPI + TensorFlow/Keras
- **Frontend:** React + Vite (coming in Brief 02)
- **Database:** SQLAlchemy 2.x + Alembic (SQLite dev, PostgreSQL-ready)
- **Model:** Custom CNN — 23 fish classes, 128×128 RGB input

## Testing

```bash
cd backend
pytest tests/ -v
ruff check .
ruff format --check .
```

## Environment Variables

See `backend/.env.example` for all configuration options.

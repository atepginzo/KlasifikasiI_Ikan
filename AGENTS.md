# Agent Instructions — AI Fish Image Classifier

> This file is the **single source of truth** for agent rules. `CLAUDE.md` imports this.

## Stack
- **Backend:** Python 3.12 + FastAPI + TensorFlow/Keras
- **Frontend:** React + Vite (Brief 02)
- **Database:** SQLAlchemy 2.x + Alembic (SQLite dev, PostgreSQL-ready)
- **Linting:** ruff + ruff format

## Hard Rules
1. **No retraining** the model; **no architecture changes** to the CNN.
2. **No Streamlit.** React + Vite (frontend), FastAPI (backend).
3. Model file: `best_fish_cnn.keras`. Config sources: `class_mapping.json`, `model_config.json`.
4. Labels: `fish_01`…`fish_23`. Do NOT invent species names or reorder mapping.
5. Inference preprocessing must be **identical** to training/evaluation (RGB, 128×128, nearest interpolation, rescale 1/255).
6. **Never claim tests pass without actually running them.** Paste output.
7. No permanent image storage (default). No `.env`, secrets, or raw datasets in git.
8. Focused changes only — small commits, push frequently.

## Commands
```bash
# Backend
cd backend
pip install -r requirements.txt        # production deps
pip install -r requirements-dev.txt    # dev/test deps
uvicorn app.main:app --reload          # run dev server (port 8000)

# Testing
cd backend
pytest tests/ -v                       # run all tests
ruff check .                           # lint
ruff format --check .                  # format check

# Database
cd backend
alembic upgrade head                   # apply migrations
alembic downgrade base                 # rollback all
```

## Repository Structure
```
├── backend/
│   ├── app/ (api/routes, core, db, schemas, services, utils, main.py)
│   ├── alembic/ + alembic.ini
│   ├── models/ (best_fish_cnn.keras, class_mapping.json, model_config.json)
│   ├── tests/
│   ├── requirements.txt / requirements-dev.txt
│   └── .env.example
├── frontend/ (Brief 02)
├── docs/ (audit-report.md, artifact-manifest.md)
├── .gitignore
├── AGENTS.md (this file)
├── CLAUDE.md
└── README.md
```

## Git Workflow
- **Remote:** `https://github.com/atepginzo/KlasifikasiI_Ikan.git`
- **Main branch:** `main` — always runnable.
- **Feature branches:** `chore/phase-0-setup`, `docs/phase-1-audit`, etc.
- **Commits:** Conventional Commits, English, imperative, ≤72 char subject.
- **Push after every commit** (or every few sequential commits).
- **No `git add .`** — always `git add <file>` or `git add -p`.
- **No force push** to main. No tokens in remote URL or repo files.
- **Merge to main** only after STOP GATE approval, using `--no-ff`.

## Briefs
- **Brief 01:** Audit + Backend + Database + Tests (this phase)
- **Brief 02:** Frontend + Integration + E2E
- **Brief 03:** Documentation + Hardening + Deployment

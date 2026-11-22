.PHONY: run test lint format migrate

run:
	cd backend && uvicorn app.main:app --reload --port 8000

test:
	cd backend && pytest tests/ -v

lint:
	cd backend && ruff check .

format:
	cd backend && ruff format .

migrate:
	cd backend && alembic upgrade head

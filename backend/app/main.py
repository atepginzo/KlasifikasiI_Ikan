"""FastAPI application entry point."""

from __future__ import annotations

import time
import uuid
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.errors import register_error_handlers
from app.core.logging import logger, setup_logging
from app.services.predictor import PredictorService


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application startup and shutdown lifecycle."""
    setup_logging()
    logger.info("Starting AI Fish Image Classifier backend...")

    # Load model
    predictor = PredictorService()
    predictor.load()
    app.state.predictor = predictor

    # Ensure data directory exists for SQLite
    import os

    os.makedirs("data", exist_ok=True)

    # Purge old predictions on startup
    if settings.store_prediction_history and settings.history_retention_days > 0:
        try:
            from app.db.session import SessionLocal
            from app.services.prediction_repo import purge_old_predictions

            db = SessionLocal()
            try:
                purged = purge_old_predictions(db, settings.history_retention_days)
                if purged:
                    logger.info("Purged %d old predictions on startup", purged)
            finally:
                db.close()
        except Exception:
            logger.exception("Failed to purge old predictions")

    logger.info("Backend ready. Model loaded: %s", predictor.model_loaded)
    yield
    logger.info("Shutting down...")


app = FastAPI(
    title="AI Fish Image Classifier API",
    description="Classify fish images using a custom CNN model",
    version="0.1.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["X-Request-Id"],
)

# Register error handlers
register_error_handlers(app)


@app.middleware("http")
async def request_id_middleware(request: Request, call_next) -> Response:
    """Add request_id to every request and response."""
    request_id = str(uuid.uuid4())
    request.state.request_id = request_id

    start = time.perf_counter()
    response = await call_next(request)
    duration_ms = (time.perf_counter() - start) * 1000

    response.headers["X-Request-Id"] = request_id

    logger.info(
        "request_id=%s method=%s path=%s status=%d duration_ms=%.1f",
        request_id,
        request.method,
        request.url.path,
        response.status_code,
        duration_ms,
    )
    return response


# Register routes
from app.api.routes import health, model_info, predict, predictions  # noqa: E402

app.include_router(health.router, prefix="/api/v1", tags=["health"])
app.include_router(model_info.router, prefix="/api/v1", tags=["model"])
app.include_router(predict.router, prefix="/api/v1", tags=["predict"])
app.include_router(predictions.router, prefix="/api/v1", tags=["predictions"])

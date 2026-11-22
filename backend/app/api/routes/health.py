"""Health check endpoint."""

from __future__ import annotations

from fastapi import APIRouter, Request

from app.db.session import check_db_connection
from app.schemas.schemas import HealthResponse

router = APIRouter()


@router.get("/health", response_model=HealthResponse)
def health(request: Request) -> HealthResponse:
    """Return application health status."""
    predictor = request.app.state.predictor
    return HealthResponse(
        status="ok" if predictor.model_loaded else "degraded",
        model_loaded=predictor.model_loaded,
        model_version=predictor.model_version if predictor.model_loaded else None,
        db_ok=check_db_connection(),
    )

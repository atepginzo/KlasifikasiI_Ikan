"""Prediction history and feedback endpoints."""

from __future__ import annotations

import json
import logging
import uuid

from fastapi import APIRouter, Depends, Header, HTTPException, Query
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.schemas import (
    FeedbackOut,
    FeedbackRequest,
    FeedbackResponse,
    PredictionDetail,
    PredictionListResponse,
    SuccessResponse,
    TopPrediction,
)
from app.services import prediction_repo
from app.services.prediction_repo import VALID_LABELS

router = APIRouter()
logger = logging.getLogger("app.predictions")


def _require_client_id(x_client_id: str = Header()) -> str:
    """Require and validate X-Client-Id header."""
    try:
        uuid.UUID(x_client_id)
        return x_client_id
    except (ValueError, AttributeError) as exc:
        raise HTTPException(
            status_code=400,
            detail="Header X-Client-Id harus berformat UUID yang valid.",
        ) from exc


def _prediction_to_detail(pred) -> PredictionDetail:
    """Convert ORM Prediction to response schema."""
    top_preds = json.loads(pred.top_predictions) if pred.top_predictions else []
    feedback_out = None
    if pred.feedback:
        feedback_out = FeedbackOut(
            id=pred.feedback.id,
            is_correct=pred.feedback.is_correct,
            corrected_class=pred.feedback.corrected_class,
            created_at=pred.feedback.created_at,
        )
    return PredictionDetail(
        id=pred.id,
        created_at=pred.created_at,
        predicted_class=pred.predicted_class,
        confidence=pred.confidence,
        top_predictions=[TopPrediction(**tp) for tp in top_preds],
        model_version=pred.model_version,
        inference_ms=pred.inference_ms,
        image_sha256=pred.image_sha256,
        image_width=pred.image_width,
        image_height=pred.image_height,
        file_size_bytes=pred.file_size_bytes,
        content_type=pred.content_type,
        feedback=feedback_out,
    )


@router.get("/predictions", response_model=PredictionListResponse)
def list_predictions(
    client_id: str = Depends(_require_client_id),
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    db: Session = Depends(get_db),
) -> PredictionListResponse:
    """List prediction history for the current client."""
    items, total = prediction_repo.list_predictions(db, client_id, limit, offset)
    return PredictionListResponse(
        success=True,
        data=[_prediction_to_detail(p) for p in items],
        total=total,
        limit=limit,
        offset=offset,
    )


@router.get("/predictions/{prediction_id}", response_model=PredictionDetail)
def get_prediction(
    prediction_id: str,
    client_id: str = Depends(_require_client_id),
    db: Session = Depends(get_db),
) -> PredictionDetail:
    """Get a single prediction by ID."""
    pred = prediction_repo.get_prediction(db, prediction_id, client_id)
    if pred is None:
        raise HTTPException(status_code=404, detail="Prediksi tidak ditemukan.")
    return _prediction_to_detail(pred)


@router.delete("/predictions/{prediction_id}", response_model=SuccessResponse)
def delete_prediction(
    prediction_id: str,
    client_id: str = Depends(_require_client_id),
    db: Session = Depends(get_db),
) -> SuccessResponse:
    """Delete a single prediction."""
    deleted = prediction_repo.delete_prediction(db, prediction_id, client_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Prediksi tidak ditemukan.")
    return SuccessResponse(message="Prediksi berhasil dihapus.")


@router.delete("/predictions", response_model=SuccessResponse)
def delete_all_predictions(
    client_id: str = Depends(_require_client_id),
    db: Session = Depends(get_db),
) -> SuccessResponse:
    """Delete all predictions for the current client."""
    count = prediction_repo.delete_all_predictions(db, client_id)
    return SuccessResponse(message=f"{count} prediksi berhasil dihapus.")


@router.post("/predictions/{prediction_id}/feedback", response_model=FeedbackResponse)
def submit_feedback(
    prediction_id: str,
    body: FeedbackRequest,
    client_id: str = Depends(_require_client_id),
    db: Session = Depends(get_db),
) -> FeedbackResponse:
    """Submit or update feedback for a prediction."""
    # Additional validation beyond pydantic regex
    if body.corrected_class is not None and body.corrected_class not in VALID_LABELS:
        raise HTTPException(
            status_code=400,
            detail=f"Label '{body.corrected_class}' tidak valid. "
            "Harus salah satu dari fish_01 sampai fish_23.",
        )

    try:
        fb = prediction_repo.save_feedback(
            db, prediction_id, client_id, body.is_correct, body.corrected_class
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    if fb is None:
        raise HTTPException(status_code=404, detail="Prediksi tidak ditemukan.")

    return FeedbackResponse(
        success=True,
        feedback=FeedbackOut(
            id=fb.id,
            is_correct=fb.is_correct,
            corrected_class=fb.corrected_class,
            created_at=fb.created_at,
        ),
    )

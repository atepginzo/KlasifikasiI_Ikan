"""Prediction history repository — data access layer."""

from __future__ import annotations

import json
import logging
from datetime import UTC, datetime, timedelta

from sqlalchemy.orm import Session

from app.db.models import Feedback, Prediction

logger = logging.getLogger("app.prediction_repo")

# Valid class labels
VALID_LABELS = {f"fish_{i:02d}" for i in range(1, 24)}


def save_prediction(
    db: Session,
    *,
    client_id: str,
    predicted_class: str,
    confidence: float,
    top_predictions: list[dict],
    model_version: str,
    inference_ms: float,
    image_sha256: str,
    image_width: int,
    image_height: int,
    file_size_bytes: int,
    content_type: str,
) -> Prediction:
    """Insert a prediction record and return it."""
    pred = Prediction(
        client_id=client_id,
        predicted_class=predicted_class,
        confidence=confidence,
        top_predictions=json.dumps(top_predictions),
        model_version=model_version,
        inference_ms=inference_ms,
        image_sha256=image_sha256,
        image_width=image_width,
        image_height=image_height,
        file_size_bytes=file_size_bytes,
        content_type=content_type,
    )
    db.add(pred)
    db.commit()
    db.refresh(pred)
    return pred


def list_predictions(
    db: Session,
    client_id: str,
    limit: int = 20,
    offset: int = 0,
) -> tuple[list[Prediction], int]:
    """Return paginated predictions for a client, newest first."""
    query = (
        db.query(Prediction)
        .filter(Prediction.client_id == client_id)
        .order_by(Prediction.created_at.desc())
    )
    total = query.count()
    items = query.offset(offset).limit(limit).all()
    return items, total


def get_prediction(db: Session, prediction_id: str, client_id: str) -> Prediction | None:
    """Get a single prediction by ID, scoped to client."""
    return (
        db.query(Prediction)
        .filter(Prediction.id == prediction_id, Prediction.client_id == client_id)
        .first()
    )


def delete_prediction(db: Session, prediction_id: str, client_id: str) -> bool:
    """Delete a single prediction. Returns True if deleted."""
    pred = get_prediction(db, prediction_id, client_id)
    if pred is None:
        return False
    db.delete(pred)
    db.commit()
    return True


def delete_all_predictions(db: Session, client_id: str) -> int:
    """Delete all predictions for a client. Returns count deleted."""
    count = (
        db.query(Prediction)
        .filter(Prediction.client_id == client_id)
        .delete(synchronize_session=False)
    )
    db.commit()
    return count


def save_feedback(
    db: Session,
    prediction_id: str,
    client_id: str,
    is_correct: bool,
    corrected_class: str | None,
) -> Feedback | None:
    """Create or update feedback for a prediction. Returns Feedback or None if not found."""
    pred = get_prediction(db, prediction_id, client_id)
    if pred is None:
        return None

    # Validate corrected_class
    if corrected_class is not None and corrected_class not in VALID_LABELS:
        raise ValueError(
            f"Label '{corrected_class}' tidak valid. Harus salah satu dari fish_01 sampai fish_23."
        )

    # Update existing or create new
    if pred.feedback:
        pred.feedback.is_correct = is_correct
        pred.feedback.corrected_class = corrected_class
        pred.feedback.created_at = datetime.now(UTC)
    else:
        fb = Feedback(
            prediction_id=prediction_id,
            is_correct=is_correct,
            corrected_class=corrected_class,
        )
        db.add(fb)

    db.commit()
    db.refresh(pred)
    return pred.feedback


def purge_old_predictions(db: Session, retention_days: int) -> int:
    """Delete predictions older than retention_days. Returns count deleted."""
    if retention_days <= 0:
        return 0
    cutoff = datetime.now(UTC) - timedelta(days=retention_days)
    count = (
        db.query(Prediction)
        .filter(Prediction.created_at < cutoff)
        .delete(synchronize_session=False)
    )
    db.commit()
    logger.info("Purged %d predictions older than %d days", count, retention_days)
    return count

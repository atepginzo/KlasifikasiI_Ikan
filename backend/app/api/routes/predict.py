"""Prediction endpoint."""

from __future__ import annotations

import logging
import uuid

from fastapi import APIRouter, Depends, Header, Request, UploadFile
from fastapi.concurrency import run_in_threadpool
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.errors import InvalidFileError, ModelNotReadyError
from app.db.session import get_db
from app.schemas.schemas import ModelMeta, PredictResponse, TopPrediction
from app.services import prediction_repo
from app.services.image_validation import validate_and_prepare

router = APIRouter()
logger = logging.getLogger("app.predict")


def _validate_client_id(x_client_id: str | None = Header(default=None)) -> str:
    """Validate X-Client-Id header as UUID format."""
    if not x_client_id:
        return str(uuid.uuid4())
    try:
        uuid.UUID(x_client_id)
        return x_client_id
    except ValueError:
        return str(uuid.uuid4())


@router.post("/predict", response_model=PredictResponse)
async def predict(
    request: Request,
    file: UploadFile | None = None,
    client_id: str = Depends(_validate_client_id),
    db: Session = Depends(get_db),
) -> PredictResponse:
    """Classify an uploaded fish image."""
    predictor = request.app.state.predictor
    if not predictor.model_loaded:
        raise ModelNotReadyError()

    # Validate file field is present
    if file is None:
        raise InvalidFileError("Field 'file' wajib diisi.")

    # Read file bytes with size limit
    file_bytes = await file.read()

    # Validate and prepare image
    image_info = validate_and_prepare(file_bytes, file.filename)

    # Run inference in thread pool to avoid blocking event loop
    result = await run_in_threadpool(predictor.predict, image_info.image)

    request_id = getattr(request.state, "request_id", None)

    # Optionally save to database
    prediction_id = None
    if settings.store_prediction_history:
        try:
            pred_record = prediction_repo.save_prediction(
                db,
                client_id=client_id,
                predicted_class=result["predicted_class"],
                confidence=result["confidence"],
                top_predictions=result["top_predictions"],
                model_version=result["model_version"],
                inference_ms=result["inference_ms"],
                image_sha256=image_info.image_sha256,
                image_width=image_info.original_width,
                image_height=image_info.original_height,
                file_size_bytes=image_info.file_size_bytes,
                content_type=image_info.content_type,
            )
            prediction_id = pred_record.id
        except Exception:
            # DB failure must NOT fail the prediction
            logger.exception("Failed to save prediction to database")
            prediction_id = None

    return PredictResponse(
        success=True,
        prediction_id=prediction_id,
        predicted_class=result["predicted_class"],
        confidence=result["confidence"],
        top_predictions=[TopPrediction(**tp) for tp in result["top_predictions"]],
        model=ModelMeta(
            architecture=predictor.model_config_data.get("architecture", "Custom CNN"),
            num_classes=predictor.model_config_data.get("num_classes", 23),
            version=result["model_version"],
        ),
        inference_ms=result["inference_ms"],
        request_id=request_id,
    )

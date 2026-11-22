"""Pydantic schemas for API requests and responses."""

from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, Field

# --- Health ---


class HealthResponse(BaseModel):
    status: str
    model_loaded: bool
    model_version: str | None = None
    db_ok: bool


# --- Model Info ---


class ModelLimitations(BaseModel):
    weak_classes: list[dict[str, object]]
    notes: list[str]


class ModelInfoResponse(BaseModel):
    architecture: str
    image_size: list[int]
    num_classes: int
    labels: list[str]
    normalization: str
    metrics: dict[str, float]
    limitations: ModelLimitations


# --- Prediction ---


class TopPrediction(BaseModel):
    class_name: str
    confidence: float


class ModelMeta(BaseModel):
    architecture: str
    num_classes: int
    version: str


class PredictResponse(BaseModel):
    success: bool = True
    prediction_id: str | None = None
    predicted_class: str
    confidence: float
    top_predictions: list[TopPrediction]
    model: ModelMeta
    inference_ms: float
    request_id: str | None = None


# --- Prediction History ---


class FeedbackOut(BaseModel):
    id: str
    is_correct: bool
    corrected_class: str | None = None
    created_at: datetime


class PredictionDetail(BaseModel):
    id: str
    created_at: datetime
    predicted_class: str
    confidence: float
    top_predictions: list[TopPrediction]
    model_version: str
    inference_ms: float
    image_sha256: str
    image_width: int
    image_height: int
    file_size_bytes: int
    content_type: str
    feedback: FeedbackOut | None = None


class PredictionListResponse(BaseModel):
    success: bool = True
    data: list[PredictionDetail]
    total: int
    limit: int
    offset: int


# --- Feedback ---


class FeedbackRequest(BaseModel):
    is_correct: bool
    corrected_class: str | None = Field(
        default=None,
        pattern=r"^fish_(0[1-9]|1[0-9]|2[0-3])$",
        description="Must be one of fish_01 to fish_23 if provided",
    )


class FeedbackResponse(BaseModel):
    success: bool = True
    feedback: FeedbackOut


# --- Generic ---


class SuccessResponse(BaseModel):
    success: bool = True
    message: str


class ErrorDetail(BaseModel):
    code: str
    message: str


class ErrorResponse(BaseModel):
    success: bool = False
    error: ErrorDetail
    request_id: str | None = None

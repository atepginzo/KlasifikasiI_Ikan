"""Model information endpoint."""

from __future__ import annotations

import json
from pathlib import Path

from fastapi import APIRouter, Request

from app.core.config import settings
from app.core.errors import ModelNotReadyError
from app.schemas.schemas import (
    MetricsSummary,
    ModelInfoResponse,
    ModelLimitations,
    ModelLimits,
    PerClassMetric,
)

router = APIRouter()

# Pre-computed from audit (Fase 1)
_METRICS = {
    "accuracy": 0.9917,
    "macro_f1": 0.9361,
    "weighted_f1": 0.9916,
}

_LIMITATIONS = ModelLimitations(
    weak_classes=[
        {"class": "fish_21", "f1": 0.500, "support": 3},
        {"class": "fish_20", "f1": 0.667, "support": 3},
        {"class": "fish_18", "f1": 0.875, "support": 8},
        {"class": "fish_11", "f1": 0.897, "support": 14},
        {"class": "fish_14", "f1": 0.923, "support": 14},
    ],
    notes=[
        "Model dilatih pada dataset yang tidak seimbang. "
        "Kelas dengan sedikit sampel memiliki performa lebih rendah.",
        "Label fish_01 sampai fish_23 adalah label folder dataset, "
        "bukan nama spesies biologis yang terverifikasi.",
        "Confidence dari softmax bukan jaminan akurasi. "
        "Gambar di luar distribusi dataset dapat menghasilkan prediksi keliru.",
    ],
)


def _load_evaluation_summary() -> tuple[MetricsSummary | None, list[PerClassMetric] | None]:
    """Load evaluation summary from models/evaluation_summary.json if present."""
    summary_path = Path("models/evaluation_summary.json")
    if not summary_path.exists():
        # Also check relative to backend directory
        backend_summary_path = (
            Path(__file__).resolve().parent.parent.parent / "models" / "evaluation_summary.json"
        )
        if backend_summary_path.exists():
            summary_path = backend_summary_path
        else:
            return None, None

    try:
        with open(summary_path, encoding="utf-8") as f:
            data = json.load(f)
        ms = data.get("metrics_summary")
        pcm = data.get("per_class_metrics")
        metrics_summary = MetricsSummary(**ms) if ms else None
        per_class_metrics = [PerClassMetric(**item) for item in pcm] if pcm else None
        return metrics_summary, per_class_metrics
    except Exception:
        return None, None


@router.get("/model-info", response_model=ModelInfoResponse)
def model_info(request: Request) -> ModelInfoResponse:
    """Return model metadata and evaluation metrics."""
    predictor = request.app.state.predictor
    if not predictor.model_loaded:
        raise ModelNotReadyError()

    labels = sorted(predictor.class_mapping.keys())
    metrics_summary, per_class_metrics = _load_evaluation_summary()

    limits = ModelLimits(
        max_upload_mb=settings.max_upload_mb,
        allowed_types=["image/jpeg", "image/png", "image/webp"],
        allowed_extensions=[".jpg", ".jpeg", ".png", ".webp"],
    )

    return ModelInfoResponse(
        architecture=predictor.model_config_data.get("architecture", "Custom CNN"),
        image_size=predictor.model_config_data.get("image_size", [128, 128]),
        num_classes=predictor.model_config_data.get("num_classes", 23),
        labels=labels,
        normalization=predictor.model_config_data.get("normalization", "rescale 1./255"),
        metrics=_METRICS,
        limitations=_LIMITATIONS,
        limits=limits,
        metrics_summary=metrics_summary,
        per_class_metrics=per_class_metrics,
    )

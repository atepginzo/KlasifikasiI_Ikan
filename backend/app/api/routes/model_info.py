"""Model information endpoint."""

from __future__ import annotations

from fastapi import APIRouter, Request

from app.core.errors import ModelNotReadyError
from app.schemas.schemas import ModelInfoResponse, ModelLimitations

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


@router.get("/model-info", response_model=ModelInfoResponse)
def model_info(request: Request) -> ModelInfoResponse:
    """Return model metadata and evaluation metrics."""
    predictor = request.app.state.predictor
    if not predictor.model_loaded:
        raise ModelNotReadyError()

    labels = sorted(predictor.class_mapping.keys())

    return ModelInfoResponse(
        architecture=predictor.model_config_data.get("architecture", "Custom CNN"),
        image_size=predictor.model_config_data.get("image_size", [128, 128]),
        num_classes=predictor.model_config_data.get("num_classes", 23),
        labels=labels,
        normalization=predictor.model_config_data.get("normalization", "rescale 1./255"),
        metrics=_METRICS,
        limitations=_LIMITATIONS,
    )

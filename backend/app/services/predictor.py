"""Model prediction service — loads model once, runs inference."""

from __future__ import annotations

import json
import logging
import time
from pathlib import Path

import numpy as np
from PIL import Image

from app.core.config import settings

logger = logging.getLogger("app.predictor")

def _get_interpolation():
    method = getattr(settings, "preprocess_interpolation", "nearest").lower()
    if method == "bilinear":
        return Image.BILINEAR
    return Image.NEAREST

IMAGE_SIZE = (128, 128)


class PredictorService:
    """Manages model lifecycle and inference."""

    def __init__(self):
        self.model = None
        self.class_mapping: dict[str, int] = {}  # name -> index
        self.index_to_name: dict[int, str] = {}  # index -> name
        self.model_config_data: dict = {}
        self.model_loaded: bool = False
        self.model_version: str = "unknown"
        self._num_classes: int = 23

    def load(self) -> None:
        """Load model and mappings at startup."""
        try:
            self._load_class_mapping()
            self._load_model_config()
            self._load_model()
            self._validate_model()
            self._warmup()
            self.model_loaded = True
            logger.info(
                "Model loaded successfully: %s classes, version=%s",
                self._num_classes,
                self.model_version,
            )
        except Exception:
            logger.exception("Failed to load model")
            self.model_loaded = False

    def _load_class_mapping(self) -> None:
        path = Path(settings.class_mapping_path)
        with open(path, encoding="utf-8") as f:
            self.class_mapping = json.load(f)
        self.index_to_name = {v: k for k, v in self.class_mapping.items()}
        if len(self.class_mapping) != 23:
            raise ValueError(f"Expected 23 classes in mapping, got {len(self.class_mapping)}")
        logger.info("Class mapping loaded: %d classes", len(self.class_mapping))

    def _load_model_config(self) -> None:
        path = Path(settings.model_config_path)
        with open(path, encoding="utf-8") as f:
            self.model_config_data = json.load(f)
        self.model_version = self.model_config_data.get("model_name", "unknown")
        self._num_classes = self.model_config_data.get("num_classes", 23)
        logger.info("Model config loaded: %s", self.model_config_data)

    def _load_model(self) -> None:
        import os
        import tempfile

        if "KERAS_HOME" not in os.environ:
            keras_dir = os.path.join(tempfile.gettempdir(), "keras_runtime")
            os.makedirs(keras_dir, exist_ok=True)
            os.environ["KERAS_HOME"] = keras_dir

        os.environ["TF_CPP_MIN_LOG_LEVEL"] = "2"
        os.environ["TF_ENABLE_ONEDNN_OPTS"] = "0"
        import tensorflow as tf

        path = Path(settings.model_path)
        self.model = tf.keras.models.load_model(str(path))
        logger.info("Keras model loaded from %s", path)

    def _validate_model(self) -> None:
        """Startup checks per brief 3.3."""
        # Output units = 23
        output_shape = self.model.output_shape
        if output_shape[-1] != self._num_classes:
            raise ValueError(f"Model output {output_shape[-1]} != expected {self._num_classes}")
        # Input shape check
        input_shape = self.model.input_shape
        expected_h, expected_w = self.model_config_data.get("image_size", [128, 128])
        if input_shape[1:3] != (expected_h, expected_w):
            raise ValueError(
                f"Model input shape {input_shape[1:3]} != config ({expected_h}, {expected_w})"
            )
        # Mapping size
        if len(self.class_mapping) != self._num_classes:
            raise ValueError(
                f"Mapping has {len(self.class_mapping)} classes, expected {self._num_classes}"
            )
        logger.info("Model validation passed")

    def _warmup(self) -> None:
        """Run one dummy inference to warm up the model."""
        dummy = np.zeros((1, 128, 128, 3), dtype=np.float32)
        preds = self.model.predict(dummy, verbose=0)
        prob_sum = float(preds.sum())
        if abs(prob_sum - 1.0) > 0.01:
            raise ValueError(f"Warm-up probability sum {prob_sum} != ~1.0")
        logger.info("Model warm-up complete (prob sum=%.4f)", prob_sum)

    def preprocess(self, img: Image.Image, interpolation: int | None = None) -> np.ndarray:
        """Preprocess a PIL RGB image to model input tensor.

        Pipeline (must match training/evaluation):
        1. Resize to 128x128 with configured interpolation (default NEAREST)
        2. Convert to float32 array
        3. Rescale to 0-1 range (/ 255.0)
        4. Add batch dimension
        """
        interp = interpolation if interpolation is not None else _get_interpolation()
        img_resized = img.resize(IMAGE_SIZE, interp)
        arr = np.asarray(img_resized, dtype=np.float32)
        arr = arr / 255.0
        return np.expand_dims(arr, axis=0)

    def predict(self, img: Image.Image) -> dict:
        """Run inference on a preprocessed image.

        Returns dict with predicted_class, confidence, top_predictions, inference_ms.
        """
        tensor = self.preprocess(img)

        start = time.perf_counter()
        preds = self.model.predict(tensor, verbose=0)
        inference_ms = (time.perf_counter() - start) * 1000

        probs = preds[0]  # shape (23,)

        # Sort by probability descending
        sorted_indices = np.argsort(probs)[::-1]

        # Top 5
        top_predictions = []
        for idx in sorted_indices[:5]:
            class_name = self.index_to_name.get(int(idx), f"unknown_{idx}")
            top_predictions.append({"class_name": class_name, "confidence": float(probs[idx])})

        predicted_class = top_predictions[0]["class_name"]
        confidence = top_predictions[0]["confidence"]

        return {
            "predicted_class": predicted_class,
            "confidence": confidence,
            "top_predictions": top_predictions,
            "inference_ms": round(inference_ms, 2),
            "model_version": self.model_version,
        }

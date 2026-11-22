"""Unit tests for the predictor service preprocessing."""

from __future__ import annotations

import numpy as np
from PIL import Image

from app.services.predictor import INTERPOLATION, PredictorService


class TestPreprocessing:
    """Tests for preprocessing pipeline correctness."""

    def test_output_shape(self):
        """Preprocessed output must be (1, 128, 128, 3)."""
        predictor = PredictorService()
        img = Image.new("RGB", (200, 300), color=(128, 64, 32))
        result = predictor.preprocess(img)
        assert result.shape == (1, 128, 128, 3)

    def test_output_dtype(self):
        """Output must be float32."""
        predictor = PredictorService()
        img = Image.new("RGB", (128, 128), color=(255, 255, 255))
        result = predictor.preprocess(img)
        assert result.dtype == np.float32

    def test_output_range_0_1(self):
        """All values must be in [0, 1] after /255 rescaling."""
        predictor = PredictorService()
        img = Image.new("RGB", (128, 128), color=(255, 0, 128))
        result = predictor.preprocess(img)
        assert result.min() >= 0.0
        assert result.max() <= 1.0

    def test_white_pixel_value(self):
        """White (255,255,255) should become (1.0, 1.0, 1.0)."""
        predictor = PredictorService()
        img = Image.new("RGB", (128, 128), color=(255, 255, 255))
        result = predictor.preprocess(img)
        np.testing.assert_allclose(result[0, 0, 0], [1.0, 1.0, 1.0], atol=1e-6)

    def test_black_pixel_value(self):
        """Black (0,0,0) should become (0.0, 0.0, 0.0)."""
        predictor = PredictorService()
        img = Image.new("RGB", (128, 128), color=(0, 0, 0))
        result = predictor.preprocess(img)
        np.testing.assert_allclose(result[0, 0, 0], [0.0, 0.0, 0.0], atol=1e-6)

    def test_resize_uses_nearest(self):
        """Verify NEAREST interpolation is used (no anti-aliasing artifacts)."""
        assert INTERPOLATION == Image.NEAREST

    def test_non_square_image_resized(self):
        """Non-square images are resized to 128x128."""
        predictor = PredictorService()
        img = Image.new("RGB", (640, 480), color=(100, 100, 100))
        result = predictor.preprocess(img)
        assert result.shape == (1, 128, 128, 3)

    def test_small_image_resized(self):
        """Very small images are upscaled to 128x128."""
        predictor = PredictorService()
        img = Image.new("RGB", (1, 1), color=(128, 128, 128))
        result = predictor.preprocess(img)
        assert result.shape == (1, 128, 128, 3)

    def test_preprocessing_parity_with_keras_generator(self):
        """Compare our preprocessing with Keras ImageDataGenerator pipeline.

        This tests parity between:
        - Our pipeline: PIL resize(NEAREST) → np.array / 255.0
        - Keras generator: flow_from_directory rescale=1./255 (which uses
          PIL load_img with NEAREST interpolation)

        Uses synthetic images since no test dataset is available.
        """
        predictor = PredictorService()

        # Test with multiple synthetic images of varying sizes and colors
        test_cases = [
            (200, 200, (255, 0, 0)),
            (640, 480, (0, 255, 0)),
            (50, 50, (0, 0, 255)),
            (128, 128, (128, 128, 128)),
            (300, 100, (64, 192, 32)),
        ]

        for w, h, color in test_cases:
            img = Image.new("RGB", (w, h), color=color)

            # Our pipeline
            our_result = predictor.preprocess(img)

            # Keras-equivalent pipeline (what flow_from_directory does)
            keras_img = img.resize((128, 128), Image.NEAREST)
            keras_arr = np.asarray(keras_img, dtype=np.float32) / 255.0
            keras_result = np.expand_dims(keras_arr, axis=0)

            np.testing.assert_allclose(
                our_result,
                keras_result,
                atol=1e-6,
                err_msg=f"Parity failed for image ({w}x{h}) color={color}",
            )

"""Unit tests for image validation service."""

from __future__ import annotations

import io

import pytest
from PIL import Image

from app.core.errors import FileTooLargeError, InvalidFileError, UnsupportedFormatError
from app.services.image_validation import validate_and_prepare


class TestValidateAndPrepare:
    """Tests for image validation."""

    def test_valid_jpeg(self, valid_jpeg_bytes):
        info = validate_and_prepare(valid_jpeg_bytes, "test.jpg")
        assert info.content_type == "image/jpeg"
        assert info.image.mode == "RGB"
        assert info.original_width == 200
        assert info.original_height == 200
        assert info.file_size_bytes == len(valid_jpeg_bytes)
        assert len(info.image_sha256) == 64

    def test_valid_png(self, valid_png_bytes):
        info = validate_and_prepare(valid_png_bytes, "test.png")
        assert info.content_type == "image/png"
        assert info.image.mode == "RGB"

    def test_valid_webp(self, valid_webp_bytes):
        info = validate_and_prepare(valid_webp_bytes, "test.webp")
        assert info.content_type == "image/webp"
        assert info.image.mode == "RGB"

    def test_rgba_png_converted_to_rgb(self, rgba_png_bytes):
        info = validate_and_prepare(rgba_png_bytes, "alpha.png")
        assert info.image.mode == "RGB"
        assert info.content_type == "image/png"

    def test_grayscale_jpeg_converted_to_rgb(self, grayscale_jpeg_bytes):
        info = validate_and_prepare(grayscale_jpeg_bytes, "gray.jpg")
        assert info.image.mode == "RGB"

    def test_tiny_image(self, tiny_image_bytes):
        info = validate_and_prepare(tiny_image_bytes, "tiny.png")
        assert info.original_width == 1
        assert info.original_height == 1

    def test_empty_bytes_raises(self):
        with pytest.raises(InvalidFileError):
            validate_and_prepare(b"", "empty.jpg")

    def test_corrupt_data_raises(self):
        with pytest.raises(InvalidFileError):
            validate_and_prepare(b"not an image at all", "bad.jpg")

    def test_unsupported_format_bmp(self):
        img = Image.new("RGB", (10, 10))
        buf = io.BytesIO()
        img.save(buf, format="BMP")
        with pytest.raises(UnsupportedFormatError):
            validate_and_prepare(buf.getvalue(), "test.bmp")

    def test_txt_file_with_image_extension(self):
        with pytest.raises(InvalidFileError):
            validate_and_prepare(b"Hello, I am not an image", "fake.jpg")

    def test_file_too_large(self):
        # Create data exceeding limit (default 5 MB)
        big_data = b"\x00" * (6 * 1024 * 1024)
        with pytest.raises(FileTooLargeError):
            validate_and_prepare(big_data, "big.jpg")

    def test_unsupported_extension_advisory(self):
        """Extension check is advisory — .gif extension rejected."""
        img = Image.new("RGB", (10, 10))
        buf = io.BytesIO()
        img.save(buf, format="PNG")
        # rename to .gif — extension check catches it first
        with pytest.raises(UnsupportedFormatError):
            validate_and_prepare(buf.getvalue(), "test.gif")

"""Image validation service."""

from __future__ import annotations

import hashlib
import io

from PIL import Image, ImageOps

from app.core.config import settings
from app.core.errors import FileTooLargeError, InvalidFileError, UnsupportedFormatError

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}
ALLOWED_MIME_TYPES = {"image/jpeg", "image/png", "image/webp"}


class ImageInfo:
    """Validated image information."""

    __slots__ = (
        "image",
        "original_width",
        "original_height",
        "file_size_bytes",
        "content_type",
        "image_sha256",
    )

    def __init__(
        self,
        image: Image.Image,
        original_width: int,
        original_height: int,
        file_size_bytes: int,
        content_type: str,
        image_sha256: str,
    ):
        self.image = image
        self.original_width = original_width
        self.original_height = original_height
        self.file_size_bytes = file_size_bytes
        self.content_type = content_type
        self.image_sha256 = image_sha256


def _read_with_limit(data: bytes) -> bytes:
    """Enforce upload size limit."""
    max_bytes = settings.max_upload_bytes
    if len(data) > max_bytes:
        raise FileTooLargeError(
            f"Ukuran file ({len(data) / 1024 / 1024:.1f} MB) melebihi batas "
            f"maksimum ({settings.max_upload_mb} MB)."
        )
    return data


def _check_extension(filename: str | None) -> None:
    """Check file extension (advisory, not sole validation)."""
    if not filename:
        return
    import os

    ext = os.path.splitext(filename)[1].lower()
    if ext and ext not in ALLOWED_EXTENSIONS:
        raise UnsupportedFormatError(
            f"Ekstensi file '{ext}' tidak didukung. Gunakan JPG, PNG, atau WebP."
        )


def validate_and_prepare(file_bytes: bytes, filename: str | None = None) -> ImageInfo:
    """Validate uploaded image bytes and return prepared ImageInfo.

    Raises AppError subclasses on validation failure.
    """
    if not file_bytes:
        raise InvalidFileError("File kosong atau tidak dikirim.")

    # Size limit
    _read_with_limit(file_bytes)

    # Extension check (advisory)
    _check_extension(filename)

    # SHA-256 hash of raw bytes
    image_sha256 = hashlib.sha256(file_bytes).hexdigest()

    # Set decompression bomb limit
    Image.MAX_IMAGE_PIXELS = settings.max_image_pixels

    # Try to open and verify
    try:
        img = Image.open(io.BytesIO(file_bytes))
        img.verify()
    except Exception as exc:
        raise InvalidFileError("File tidak dapat dibaca sebagai gambar yang valid.") from exc

    # Reopen after verify (verify() leaves the image in an unusable state)
    try:
        img = Image.open(io.BytesIO(file_bytes))
    except Exception as exc:
        raise InvalidFileError("File gambar rusak.") from exc

    # Check actual image format
    fmt = (img.format or "").upper()
    format_to_mime = {"JPEG": "image/jpeg", "PNG": "image/png", "WEBP": "image/webp"}
    content_type = format_to_mime.get(fmt)
    if content_type is None:
        raise UnsupportedFormatError(
            f"Format gambar '{fmt or 'unknown'}' tidak didukung. Gunakan JPG, PNG, atau WebP."
        )

    # Store original dimensions before any transforms
    original_width, original_height = img.size

    # EXIF transpose (handle phone photos)
    # Conscious decision: training dataset has no EXIF, so this doesn't affect parity
    img = ImageOps.exif_transpose(img)

    # Convert to RGB
    if img.mode == "RGBA":
        # Composite on white background to avoid alpha artifacts
        background = Image.new("RGB", img.size, (255, 255, 255))
        background.paste(img, mask=img.split()[3])
        img = background
    elif img.mode != "RGB":
        img = img.convert("RGB")

    return ImageInfo(
        image=img,
        original_width=original_width,
        original_height=original_height,
        file_size_bytes=len(file_bytes),
        content_type=content_type,
        image_sha256=image_sha256,
    )

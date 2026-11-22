"""Centralised error handling and exception classes."""

from __future__ import annotations

from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse


class AppError(Exception):
    """Base application error."""

    def __init__(self, code: str, message: str, http_status: int = 500):
        self.code = code
        self.message = message
        self.http_status = http_status
        super().__init__(message)


class UnsupportedFormatError(AppError):
    def __init__(self, message: str = "Format file tidak didukung. Gunakan JPG, PNG, atau WebP."):
        super().__init__("UNSUPPORTED_FORMAT", message, status.HTTP_415_UNSUPPORTED_MEDIA_TYPE)


class FileTooLargeError(AppError):
    def __init__(self, message: str = "Ukuran file melebihi batas maksimum."):
        super().__init__("FILE_TOO_LARGE", message, status.HTTP_413_CONTENT_TOO_LARGE)


class InvalidFileError(AppError):
    def __init__(self, message: str = "File tidak valid, kosong, atau rusak."):
        super().__init__("INVALID_FILE", message, status.HTTP_400_BAD_REQUEST)


class ModelNotReadyError(AppError):
    def __init__(self, message: str = "Model belum siap. Silakan coba lagi nanti."):
        super().__init__("MODEL_NOT_READY", message, status.HTTP_503_SERVICE_UNAVAILABLE)


def _error_response(request: Request, code: str, message: str, http_status: int) -> JSONResponse:
    request_id = getattr(request.state, "request_id", None)
    return JSONResponse(
        status_code=http_status,
        content={
            "success": False,
            "error": {"code": code, "message": message},
            "request_id": request_id,
        },
    )


def register_error_handlers(app: FastAPI) -> None:
    """Attach global exception handlers to the app."""

    @app.exception_handler(AppError)
    async def app_error_handler(request: Request, exc: AppError) -> JSONResponse:
        return _error_response(request, exc.code, exc.message, exc.http_status)

    @app.exception_handler(RequestValidationError)
    async def validation_error_handler(
        request: Request, exc: RequestValidationError
    ) -> JSONResponse:
        details = "; ".join(
            f"{'.'.join(str(part) for part in e['loc'])}: {e['msg']}" for e in exc.errors()
        )
        return _error_response(
            request,
            "VALIDATION_ERROR",
            f"Data tidak valid: {details}",
            status.HTTP_400_BAD_REQUEST,
        )

    @app.exception_handler(Exception)
    async def generic_error_handler(request: Request, exc: Exception) -> JSONResponse:
        from app.core.logging import logger

        logger.exception("Unhandled error: %s", exc)
        return _error_response(
            request,
            "INTERNAL_ERROR",
            "Terjadi kesalahan internal. Silakan coba lagi.",
            status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

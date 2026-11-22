"""Application configuration via environment variables."""

from __future__ import annotations

from pathlib import Path

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings loaded from environment / .env file."""

    # General
    app_env: str = "development"
    log_level: str = "INFO"

    # Model paths (relative to backend/)
    model_path: str = "models/best_fish_cnn.keras"
    class_mapping_path: str = "models/class_mapping.json"
    model_config_path: str = "models/model_config.json"

    # Upload limits
    max_upload_mb: int = 5
    max_image_pixels: int = 25_000_000
    preprocess_interpolation: str = "nearest"

    # CORS
    allowed_origins: str = "http://localhost:5173"

    # Database
    database_url: str = "sqlite:///./data/app.db"
    store_prediction_history: bool = True
    history_retention_days: int = 30

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8", "extra": "ignore"}

    @property
    def max_upload_bytes(self) -> int:
        return self.max_upload_mb * 1024 * 1024

    @property
    def cors_origins(self) -> list[str]:
        return [o.strip() for o in self.allowed_origins.split(",") if o.strip()]

    @property
    def model_abs_path(self) -> Path:
        return Path(self.model_path)

    @property
    def class_mapping_abs_path(self) -> Path:
        return Path(self.class_mapping_path)

    @property
    def model_config_abs_path(self) -> Path:
        return Path(self.model_config_path)


settings = Settings()

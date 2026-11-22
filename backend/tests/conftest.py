"""Shared test fixtures."""

from __future__ import annotations

import io
import os
import sys
import uuid

import pytest
from PIL import Image
from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker

# Ensure backend is on path
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

os.environ["DATABASE_URL"] = "sqlite://"  # in-memory
os.environ["STORE_PREDICTION_HISTORY"] = "true"
os.environ["MODEL_PATH"] = "models/best_fish_cnn.keras"
os.environ["CLASS_MAPPING_PATH"] = "models/class_mapping.json"
os.environ["MODEL_CONFIG_PATH"] = "models/model_config.json"
os.environ["TF_CPP_MIN_LOG_LEVEL"] = "3"
os.environ["TF_ENABLE_ONEDNN_OPTS"] = "0"
os.environ["KERAS_HOME"] = os.path.join(os.environ.get("TEMP", "/tmp"), "keras_test")

from app.db.base import Base
from app.db.models import Feedback, Prediction  # noqa: F401
from app.db.session import get_db


@pytest.fixture(scope="session")
def db_engine():
    """Create an in-memory SQLite engine for tests."""
    engine = create_engine("sqlite://", connect_args={"check_same_thread": False})

    @event.listens_for(engine, "connect")
    def _set_sqlite_pragma(dbapi_conn, connection_record):
        cursor = dbapi_conn.cursor()
        cursor.execute("PRAGMA foreign_keys=ON")
        cursor.close()

    Base.metadata.create_all(bind=engine)
    yield engine
    engine.dispose()


@pytest.fixture()
def db_session(db_engine):
    """Yield a fresh DB session per test, rolled back after."""
    connection = db_engine.connect()
    transaction = connection.begin()
    Session = sessionmaker(bind=connection)
    session = Session()

    yield session

    session.close()
    transaction.rollback()
    connection.close()


@pytest.fixture()
def client(db_session):
    """Create a TestClient with overridden DB dependency."""
    from fastapi.testclient import TestClient

    from app.main import app

    def _override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = _override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()


@pytest.fixture()
def client_id():
    """Generate a random client ID."""
    return str(uuid.uuid4())


@pytest.fixture()
def valid_jpeg_bytes():
    """Create a minimal valid JPEG image."""
    img = Image.new("RGB", (200, 200), color=(128, 64, 32))
    buf = io.BytesIO()
    img.save(buf, format="JPEG")
    return buf.getvalue()


@pytest.fixture()
def valid_png_bytes():
    """Create a minimal valid PNG image."""
    img = Image.new("RGB", (150, 150), color=(64, 128, 32))
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    return buf.getvalue()


@pytest.fixture()
def valid_webp_bytes():
    """Create a minimal valid WebP image."""
    img = Image.new("RGB", (100, 100), color=(32, 64, 128))
    buf = io.BytesIO()
    img.save(buf, format="WEBP")
    return buf.getvalue()


@pytest.fixture()
def rgba_png_bytes():
    """Create a PNG with alpha channel."""
    img = Image.new("RGBA", (128, 128), color=(255, 0, 0, 128))
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    return buf.getvalue()


@pytest.fixture()
def grayscale_jpeg_bytes():
    """Create a grayscale JPEG."""
    img = Image.new("L", (128, 128), color=128)
    buf = io.BytesIO()
    img.save(buf, format="JPEG")
    return buf.getvalue()


@pytest.fixture()
def tiny_image_bytes():
    """Create a very small image (1x1)."""
    img = Image.new("RGB", (1, 1), color=(255, 255, 255))
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    return buf.getvalue()

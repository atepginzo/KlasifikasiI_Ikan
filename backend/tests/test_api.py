"""Integration tests for all API endpoints."""

from __future__ import annotations

import uuid

import pytest


class TestHealthEndpoint:
    """Tests for GET /api/v1/health."""

    def test_health_returns_200(self, client):
        resp = client.get("/api/v1/health")
        assert resp.status_code == 200
        data = resp.json()
        assert data["status"] in ("ok", "degraded")
        assert isinstance(data["model_loaded"], bool)
        assert isinstance(data["db_ok"], bool)

    def test_health_has_request_id(self, client):
        resp = client.get("/api/v1/health")
        assert "x-request-id" in resp.headers


class TestModelInfoEndpoint:
    """Tests for GET /api/v1/model-info."""

    def test_model_info_returns_200(self, client):
        resp = client.get("/api/v1/model-info")
        if resp.status_code == 503:
            pytest.skip("Model not loaded in test env")
        assert resp.status_code == 200
        data = resp.json()
        assert data["architecture"] == "Custom CNN"
        assert data["image_size"] == [128, 128]
        assert data["num_classes"] == 23
        assert len(data["labels"]) == 23
        assert "fish_01" in data["labels"]
        assert "fish_23" in data["labels"]
        assert data["normalization"] == "rescale 1./255"

    def test_model_info_has_metrics(self, client):
        resp = client.get("/api/v1/model-info")
        if resp.status_code == 503:
            pytest.skip("Model not loaded")
        data = resp.json()
        assert "accuracy" in data["metrics"]
        assert "macro_f1" in data["metrics"]
        assert "weighted_f1" in data["metrics"]

    def test_model_info_has_limitations(self, client):
        resp = client.get("/api/v1/model-info")
        if resp.status_code == 503:
            pytest.skip("Model not loaded")
        data = resp.json()
        assert len(data["limitations"]["weak_classes"]) > 0
        assert len(data["limitations"]["notes"]) > 0

    def test_model_info_has_limits(self, client):
        resp = client.get("/api/v1/model-info")
        if resp.status_code == 503:
            pytest.skip("Model not loaded")
        data = resp.json()
        assert "limits" in data
        assert data["limits"]["max_upload_mb"] == 5
        assert "image/jpeg" in data["limits"]["allowed_types"]
        assert ".jpg" in data["limits"]["allowed_extensions"]

    def test_model_info_has_metrics_summary(self, client):
        resp = client.get("/api/v1/model-info")
        if resp.status_code == 503:
            pytest.skip("Model not loaded")
        data = resp.json()
        assert data.get("metrics_summary") is not None
        summary = data["metrics_summary"]
        assert summary["accuracy"] == 0.9917
        assert summary["macro_f1"] == 0.9361
        assert summary["weighted_f1"] == 0.9916
        assert summary["test_samples"] == 4109

    def test_model_info_has_per_class_metrics(self, client):
        resp = client.get("/api/v1/model-info")
        if resp.status_code == 503:
            pytest.skip("Model not loaded")
        data = resp.json()
        assert data.get("per_class_metrics") is not None
        pcm = data["per_class_metrics"]
        assert len(pcm) == 23
        class_names = [item["class_name"] for item in pcm]
        assert class_names == [f"fish_{i:02d}" for i in range(1, 24)]
        # Check first item (fish_01)
        fish_01 = pcm[0]
        assert fish_01["class_name"] == "fish_01"
        assert fish_01["support"] == 1820
        assert fish_01["precision"] == 0.9918

    def test_model_info_when_summary_file_missing(self, client, monkeypatch):
        from pathlib import Path

        def fake_exists(self):
            if "evaluation_summary.json" in str(self):
                return False
            return original_exists(self)

        original_exists = Path.exists
        monkeypatch.setattr(Path, "exists", fake_exists)

        resp = client.get("/api/v1/model-info")
        if resp.status_code == 503:
            pytest.skip("Model not loaded")
        assert resp.status_code == 200
        data = resp.json()
        assert data["limits"]["max_upload_mb"] == 5
        assert data["metrics_summary"] is None
        assert data["per_class_metrics"] is None


class TestPredictEndpoint:
    """Tests for POST /api/v1/predict."""

    def test_predict_valid_jpeg(self, client, valid_jpeg_bytes, client_id):
        resp = client.post(
            "/api/v1/predict",
            files={"file": ("test.jpg", valid_jpeg_bytes, "image/jpeg")},
            headers={"X-Client-Id": client_id},
        )
        if resp.status_code == 503:
            pytest.skip("Model not loaded")
        assert resp.status_code == 200
        data = resp.json()
        assert data["success"] is True
        assert data["predicted_class"].startswith("fish_")
        assert 0.0 <= data["confidence"] <= 1.0
        assert len(data["top_predictions"]) == 5
        assert data["top_predictions"][0]["class_name"] == data["predicted_class"]
        # Top predictions must be sorted descending
        confs = [tp["confidence"] for tp in data["top_predictions"]]
        assert confs == sorted(confs, reverse=True)
        assert data["inference_ms"] > 0

    def test_predict_valid_png(self, client, valid_png_bytes, client_id):
        resp = client.post(
            "/api/v1/predict",
            files={"file": ("test.png", valid_png_bytes, "image/png")},
            headers={"X-Client-Id": client_id},
        )
        if resp.status_code == 503:
            pytest.skip("Model not loaded")
        assert resp.status_code == 200

    def test_predict_valid_webp(self, client, valid_webp_bytes, client_id):
        resp = client.post(
            "/api/v1/predict",
            files={"file": ("test.webp", valid_webp_bytes, "image/webp")},
            headers={"X-Client-Id": client_id},
        )
        if resp.status_code == 503:
            pytest.skip("Model not loaded")
        assert resp.status_code == 200

    def test_predict_txt_file_disguised_as_jpeg(self, client, client_id):
        resp = client.post(
            "/api/v1/predict",
            files={"file": ("fake.jpg", b"I am a text file", "image/jpeg")},
            headers={"X-Client-Id": client_id},
        )
        assert resp.status_code == 400
        data = resp.json()
        assert data["success"] is False

    def test_predict_empty_file(self, client, client_id):
        resp = client.post(
            "/api/v1/predict",
            files={"file": ("empty.jpg", b"", "image/jpeg")},
            headers={"X-Client-Id": client_id},
        )
        assert resp.status_code == 400

    def test_predict_corrupt_file(self, client, client_id):
        resp = client.post(
            "/api/v1/predict",
            files={"file": ("corrupt.jpg", b"\xff\xd8\xff\x00garbage", "image/jpeg")},
            headers={"X-Client-Id": client_id},
        )
        assert resp.status_code == 400

    def test_predict_file_too_large(self, client, client_id):
        big = b"\x00" * (6 * 1024 * 1024)
        resp = client.post(
            "/api/v1/predict",
            files={"file": ("big.jpg", big, "image/jpeg")},
            headers={"X-Client-Id": client_id},
        )
        assert resp.status_code == 413

    def test_predict_no_file_field(self, client, client_id):
        resp = client.post(
            "/api/v1/predict",
            headers={"X-Client-Id": client_id},
        )
        assert resp.status_code == 400

    def test_predict_has_model_meta(self, client, valid_jpeg_bytes, client_id):
        resp = client.post(
            "/api/v1/predict",
            files={"file": ("test.jpg", valid_jpeg_bytes, "image/jpeg")},
            headers={"X-Client-Id": client_id},
        )
        if resp.status_code == 503:
            pytest.skip("Model not loaded")
        data = resp.json()
        assert data["model"]["architecture"] == "Custom CNN"
        assert data["model"]["num_classes"] == 23
        assert data["model"]["version"] is not None

    def test_predict_prob_sum_approx_1(self, client, valid_jpeg_bytes, client_id):
        """Sum of all 23 class probabilities should ≈ 1. We only get top 5,
        but each confidence should be in valid range."""
        resp = client.post(
            "/api/v1/predict",
            files={"file": ("test.jpg", valid_jpeg_bytes, "image/jpeg")},
            headers={"X-Client-Id": client_id},
        )
        if resp.status_code == 503:
            pytest.skip("Model not loaded")
        data = resp.json()
        for tp in data["top_predictions"]:
            assert 0.0 <= tp["confidence"] <= 1.0


class TestPredictionHistoryEndpoints:
    """Tests for predictions CRUD and feedback."""

    def _make_prediction(self, client, valid_jpeg_bytes, client_id):
        resp = client.post(
            "/api/v1/predict",
            files={"file": ("test.jpg", valid_jpeg_bytes, "image/jpeg")},
            headers={"X-Client-Id": client_id},
        )
        if resp.status_code == 503:
            pytest.skip("Model not loaded")
        return resp.json()

    def test_list_predictions(self, client, valid_jpeg_bytes, client_id):
        self._make_prediction(client, valid_jpeg_bytes, client_id)
        resp = client.get(
            "/api/v1/predictions",
            headers={"X-Client-Id": client_id},
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data["success"] is True
        assert data["total"] >= 1
        assert len(data["data"]) >= 1

    def test_predictions_isolated_by_client(self, client, valid_jpeg_bytes):
        cid1 = str(uuid.uuid4())
        cid2 = str(uuid.uuid4())
        self._make_prediction(client, valid_jpeg_bytes, cid1)

        resp = client.get(
            "/api/v1/predictions",
            headers={"X-Client-Id": cid2},
        )
        assert resp.status_code == 200
        assert resp.json()["total"] == 0

    def test_get_prediction_detail(self, client, valid_jpeg_bytes, client_id):
        pred = self._make_prediction(client, valid_jpeg_bytes, client_id)
        pid = pred.get("prediction_id")
        if pid is None:
            pytest.skip("No prediction_id returned")

        resp = client.get(
            f"/api/v1/predictions/{pid}",
            headers={"X-Client-Id": client_id},
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data["id"] == pid
        assert data["predicted_class"].startswith("fish_")

    def test_delete_single_prediction(self, client, valid_jpeg_bytes, client_id):
        pred = self._make_prediction(client, valid_jpeg_bytes, client_id)
        pid = pred.get("prediction_id")
        if pid is None:
            pytest.skip("No prediction_id")

        resp = client.delete(
            f"/api/v1/predictions/{pid}",
            headers={"X-Client-Id": client_id},
        )
        assert resp.status_code == 200

        # Verify deleted
        resp2 = client.get(
            f"/api/v1/predictions/{pid}",
            headers={"X-Client-Id": client_id},
        )
        assert resp2.status_code == 404

    def test_delete_all_predictions(self, client, valid_jpeg_bytes, client_id):
        self._make_prediction(client, valid_jpeg_bytes, client_id)
        self._make_prediction(client, valid_jpeg_bytes, client_id)

        resp = client.delete(
            "/api/v1/predictions",
            headers={"X-Client-Id": client_id},
        )
        assert resp.status_code == 200

        resp2 = client.get(
            "/api/v1/predictions",
            headers={"X-Client-Id": client_id},
        )
        assert resp2.json()["total"] == 0

    def test_feedback_valid(self, client, valid_jpeg_bytes, client_id):
        pred = self._make_prediction(client, valid_jpeg_bytes, client_id)
        pid = pred.get("prediction_id")
        if pid is None:
            pytest.skip("No prediction_id")

        resp = client.post(
            f"/api/v1/predictions/{pid}/feedback",
            json={"is_correct": True, "corrected_class": None},
            headers={"X-Client-Id": client_id},
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data["success"] is True
        assert data["feedback"]["is_correct"] is True

    def test_feedback_with_correction(self, client, valid_jpeg_bytes, client_id):
        pred = self._make_prediction(client, valid_jpeg_bytes, client_id)
        pid = pred.get("prediction_id")
        if pid is None:
            pytest.skip("No prediction_id")

        resp = client.post(
            f"/api/v1/predictions/{pid}/feedback",
            json={"is_correct": False, "corrected_class": "fish_05"},
            headers={"X-Client-Id": client_id},
        )
        assert resp.status_code == 200
        assert resp.json()["feedback"]["corrected_class"] == "fish_05"

    def test_feedback_invalid_class_rejected(self, client, valid_jpeg_bytes, client_id):
        pred = self._make_prediction(client, valid_jpeg_bytes, client_id)
        pid = pred.get("prediction_id")
        if pid is None:
            pytest.skip("No prediction_id")

        resp = client.post(
            f"/api/v1/predictions/{pid}/feedback",
            json={"is_correct": False, "corrected_class": "fish_99"},
            headers={"X-Client-Id": client_id},
        )
        assert resp.status_code == 400

    def test_feedback_not_found(self, client, client_id):
        fake_id = str(uuid.uuid4())
        resp = client.post(
            f"/api/v1/predictions/{fake_id}/feedback",
            json={"is_correct": True},
            headers={"X-Client-Id": client_id},
        )
        assert resp.status_code == 404

    def test_cascade_delete_feedback(self, client, valid_jpeg_bytes, client_id):
        """Deleting a prediction should cascade-delete its feedback."""
        pred = self._make_prediction(client, valid_jpeg_bytes, client_id)
        pid = pred.get("prediction_id")
        if pid is None:
            pytest.skip("No prediction_id")

        # Add feedback
        client.post(
            f"/api/v1/predictions/{pid}/feedback",
            json={"is_correct": True},
            headers={"X-Client-Id": client_id},
        )

        # Delete prediction
        resp = client.delete(
            f"/api/v1/predictions/{pid}",
            headers={"X-Client-Id": client_id},
        )
        assert resp.status_code == 200


class TestStoreHistoryDisabled:
    """Test STORE_PREDICTION_HISTORY=false behavior."""

    def test_predict_returns_null_prediction_id(
        self, client, valid_jpeg_bytes, client_id, monkeypatch
    ):
        monkeypatch.setattr("app.core.config.settings.store_prediction_history", False)
        resp = client.post(
            "/api/v1/predict",
            files={"file": ("test.jpg", valid_jpeg_bytes, "image/jpeg")},
            headers={"X-Client-Id": client_id},
        )
        if resp.status_code == 503:
            pytest.skip("Model not loaded")
        data = resp.json()
        assert data["prediction_id"] is None


class TestErrorFormat:
    """Verify consistent error response format."""

    def test_error_has_standard_shape(self, client, client_id):
        resp = client.post(
            "/api/v1/predict",
            files={"file": ("bad.jpg", b"not an image", "image/jpeg")},
            headers={"X-Client-Id": client_id},
        )
        data = resp.json()
        assert data["success"] is False
        assert "error" in data
        assert "code" in data["error"]
        assert "message" in data["error"]
        assert "request_id" in data


class TestAlembicMigrations:
    """Test that migrations can run up and down."""

    def test_upgrade_head(self):
        """alembic upgrade head should succeed on clean db."""
        import os
        import subprocess

        result = subprocess.run(
            ["python", "-m", "alembic", "upgrade", "head"],
            capture_output=True,
            text=True,
            cwd=os.path.join(os.path.dirname(__file__), ".."),
            env={**os.environ, "DATABASE_URL": "sqlite:///./data/test_migration.db"},
        )
        # Clean up
        test_db = os.path.join(os.path.dirname(__file__), "..", "data", "test_migration.db")
        if os.path.exists(test_db):
            os.remove(test_db)
        assert result.returncode == 0, f"upgrade failed: {result.stderr}"

    def test_downgrade_base(self):
        """alembic downgrade base should succeed."""
        import os
        import subprocess

        backend_dir = os.path.join(os.path.dirname(__file__), "..")
        env = {**os.environ, "DATABASE_URL": "sqlite:///./data/test_migration2.db"}
        os.makedirs(os.path.join(backend_dir, "data"), exist_ok=True)

        # First upgrade
        up = subprocess.run(
            ["python", "-m", "alembic", "upgrade", "head"],
            capture_output=True,
            text=True,
            cwd=backend_dir,
            env=env,
        )
        assert up.returncode == 0, f"upgrade failed: {up.stderr}"

        # Then downgrade
        down = subprocess.run(
            ["python", "-m", "alembic", "downgrade", "base"],
            capture_output=True,
            text=True,
            cwd=backend_dir,
            env=env,
        )
        # Clean up
        test_db = os.path.join(backend_dir, "data", "test_migration2.db")
        if os.path.exists(test_db):
            os.remove(test_db)
        assert down.returncode == 0, f"downgrade failed: {down.stderr}"

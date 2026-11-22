"""Unit tests for class mapping and model config validation."""

from __future__ import annotations

import json
import os


class TestClassMapping:
    """Validate class_mapping.json integrity."""

    def setup_method(self):
        path = os.path.join(os.path.dirname(__file__), "..", "models", "class_mapping.json")
        with open(path, encoding="utf-8") as f:
            self.mapping = json.load(f)

    def test_has_23_classes(self):
        assert len(self.mapping) == 23

    def test_labels_format(self):
        for label in self.mapping:
            assert label.startswith("fish_"), f"Bad label: {label}"
            num = int(label.split("_")[1])
            assert 1 <= num <= 23, f"Label out of range: {label}"

    def test_indices_0_to_22(self):
        indices = sorted(self.mapping.values())
        assert indices == list(range(23))

    def test_all_indices_unique(self):
        assert len(set(self.mapping.values())) == 23

    def test_name_to_index_invertible(self):
        inverted = {v: k for k, v in self.mapping.items()}
        assert len(inverted) == 23
        for idx in range(23):
            assert idx in inverted

    def test_alphabetical_equals_numerical(self):
        """Zero-padded names sort alphabetically = numerically."""
        sorted_names = sorted(self.mapping.keys())
        expected = [f"fish_{i:02d}" for i in range(1, 24)]
        assert sorted_names == expected


class TestModelConfig:
    """Validate model_config.json integrity."""

    def setup_method(self):
        path = os.path.join(os.path.dirname(__file__), "..", "models", "model_config.json")
        with open(path, encoding="utf-8") as f:
            self.config = json.load(f)

    def test_image_size(self):
        assert self.config["image_size"] == [128, 128]

    def test_color_mode(self):
        assert self.config["color_mode"].upper() == "RGB"

    def test_num_classes(self):
        assert self.config["num_classes"] == 23

    def test_normalization(self):
        assert "255" in self.config["normalization"]

    def test_model_file(self):
        assert self.config["model_file"] == "best_fish_cnn.keras"

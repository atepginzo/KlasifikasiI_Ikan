"""Script to convert classification_report.csv into evaluation_summary.json.

Run from repository root:
    python backend/scripts/build_eval_summary.py
"""

from __future__ import annotations

import csv
import json
from pathlib import Path


def build_evaluation_summary(csv_path: Path, output_path: Path) -> dict[str, object]:
    """Parse classification_report.csv and produce structured JSON summary."""
    if not csv_path.exists():
        raise FileNotFoundError(f"Classification report CSV not found: {csv_path}")

    per_class_metrics = []
    metrics_summary = {}

    with open(csv_path, encoding="utf-8") as f:
        reader = csv.reader(f)
        next(reader, None)  # skip header: ,precision,recall,f1-score,support
        for row in reader:
            if not row or not row[0].strip():
                continue
            name = row[0].strip()
            if name.startswith("fish_"):
                per_class_metrics.append(
                    {
                        "class_name": name,
                        "precision": round(float(row[1]), 4),
                        "recall": round(float(row[2]), 4),
                        "f1": round(float(row[3]), 4),
                        "support": int(float(row[4])),
                    }
                )
            elif name == "accuracy":
                metrics_summary["accuracy"] = round(float(row[1]), 4)
            elif name == "macro avg":
                metrics_summary["macro_f1"] = round(float(row[3]), 4)
            elif name == "weighted avg":
                metrics_summary["weighted_f1"] = round(float(row[3]), 4)
                metrics_summary["test_samples"] = int(float(row[4]))

    if len(per_class_metrics) != 23:
        raise ValueError(f"Expected 23 class metrics, but found {len(per_class_metrics)}")

    result = {
        "metrics_summary": metrics_summary,
        "per_class_metrics": per_class_metrics,
    }

    output_path.parent.mkdir(parents=True, exist_ok=True)
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(result, f, indent=2)

    print(f"Successfully generated {output_path} with {len(per_class_metrics)} classes.")
    return result


if __name__ == "__main__":
    repo_root = Path(__file__).resolve().parent.parent.parent
    csv_candidates = [
        repo_root / "_inputs" / "result" / "classification_report.csv",
        repo_root / "result" / "classification_report.csv",
    ]
    csv_file = None
    for candidate in csv_candidates:
        if candidate.exists():
            csv_file = candidate
            break

    if not csv_file:
        raise SystemExit("classification_report.csv not found in _inputs/result/ or result/")

    out_file = repo_root / "backend" / "models" / "evaluation_summary.json"
    build_evaluation_summary(csv_file, out_file)

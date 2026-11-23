import os
import sys

import pandas as pd
from PIL import Image

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from app.services.predictor import PredictorService

predictor_service = PredictorService()
predictor_service.load()

labels_path = os.path.join("..", "sample_images", "labels.csv")
df = pd.read_csv(labels_path)

results_nearest = []
results_bilinear = []
errors_nearest = []
errors_bilinear = []

print(f"Evaluating {len(df)} images under NEAREST vs BILINEAR...")

for _, row in df.iterrows():
    fname = row["file"]
    true_cls = row["true_class"]
    img_path = os.path.join("..", "sample_images", fname)
    if not os.path.exists(img_path):
        continue
    img = Image.open(img_path).convert("RGB")

    # NEAREST
    tensor_near = predictor_service.preprocess(img, interpolation=Image.NEAREST)
    preds_near = predictor_service.model.predict(tensor_near, verbose=0)[0]
    pred_near_idx = int(preds_near.argmax())
    pred_near_cls = predictor_service.index_to_name[pred_near_idx]
    near_conf = float(preds_near[pred_near_idx])

    # BILINEAR
    tensor_bi = predictor_service.preprocess(img, interpolation=Image.BILINEAR)
    preds_bi = predictor_service.model.predict(tensor_bi, verbose=0)[0]
    pred_bi_idx = int(preds_bi.argmax())
    pred_bi_cls = predictor_service.index_to_name[pred_bi_idx]
    bi_conf = float(preds_bi[pred_bi_idx])

    is_correct_near = pred_near_cls == true_cls
    is_correct_bi = pred_bi_cls == true_cls

    results_nearest.append(is_correct_near)
    results_bilinear.append(is_correct_bi)

    if not is_correct_near:
        errors_nearest.append(
            {"file": fname, "true": true_cls, "pred": pred_near_cls, "conf": near_conf}
        )
    if not is_correct_bi:
        errors_bilinear.append(
            {"file": fname, "true": true_cls, "pred": pred_bi_cls, "conf": bi_conf}
        )

acc_near = sum(results_nearest) / len(results_nearest)
acc_bi = sum(results_bilinear) / len(results_bilinear)

print("=== HASIL EVALUASI INTERPOLASI ===")
print(f"Total sampel: {len(results_nearest)}")
print(f"Akurasi NEAREST: {acc_near * 100:.2f}% ({sum(results_nearest)}/{len(results_nearest)})")
print(f"Akurasi BILINEAR: {acc_bi * 100:.2f}% ({sum(results_bilinear)}/{len(results_bilinear)})")

print(f"\nKesalahan NEAREST ({len(errors_nearest)}):")
for err in errors_nearest:
    print(f"  - {err['file']}: true={err['true']}, pred={err['pred']} ({err['conf'] * 100:.1f}%)")

print(f"\nKesalahan BILINEAR ({len(errors_bilinear)}):")
for err in errors_bilinear:
    print(f"  - {err['file']}: true={err['true']}, pred={err['pred']} ({err['conf'] * 100:.1f}%)")

# Audit Report — AI Fish Image Classifier

**Date:** 2026-11-22
**Phase:** 1 (Read-only audit)
**Auditor:** Antigravity AI Agent

---

## 1. Asset Inventory

All expected model artifacts are present at the project root. See [artifact-manifest.md](./artifact-manifest.md) for full listing with SHA-256 hashes.

**Deviation from brief:** Files are at the project root, not in `_inputs/`. The `_inputs/` folder does not exist. No action needed — files will be copied to `backend/models/` in Fase 2.

**Missing assets:**
- `sample_images/` — not provided. Preprocessing parity test (Fase 4) will need generated test images or be marked as risk.
- Training notebook/scripts — not available. Preprocessing audit relies on documentation and model config.
- `training_history.csv` — not available (confirmed by documentation).

---

## 2. Model Loading (1.2)

### Environment that successfully loads the model

| Component | Version |
|-----------|---------|
| Python | 3.12.2 |
| TensorFlow | 2.20.0 |
| Keras | 3.13.2 |

**Important:** The model was saved with **Keras 3.13.2** (metadata `date_saved: 2026-11-21@18:44:51`). The initial installed Keras 3.12.0 could NOT load the model due to unrecognized `quantization_config` parameter in Dense layers (added in Keras ≥3.4). Upgraded to 3.13.2 to match.

### Model Summary

```
Model: "sequential"
┌─────────────────────────────────┬────────────────────────┬───────────────┐
│ Layer (type)                    │ Output Shape           │       Param # │
├─────────────────────────────────┼────────────────────────┼───────────────┤
│ conv2d (Conv2D)                 │ (None, 128, 128, 32)   │           896 │
│ batch_normalization (BN)        │ (None, 128, 128, 32)   │           128 │
│ max_pooling2d (MaxPool2D)       │ (None, 64, 64, 32)     │             0 │
│ conv2d_1 (Conv2D)               │ (None, 64, 64, 64)     │        18,496 │
│ batch_normalization_1 (BN)      │ (None, 64, 64, 64)     │           256 │
│ max_pooling2d_1 (MaxPool2D)     │ (None, 32, 32, 64)     │             0 │
│ conv2d_2 (Conv2D)               │ (None, 32, 32, 128)    │        73,856 │
│ batch_normalization_2 (BN)      │ (None, 32, 32, 128)    │           512 │
│ max_pooling2d_2 (MaxPool2D)     │ (None, 16, 16, 128)    │             0 │
│ conv2d_3 (Conv2D)               │ (None, 16, 16, 256)    │       295,168 │
│ batch_normalization_3 (BN)      │ (None, 16, 16, 256)    │         1,024 │
│ max_pooling2d_3 (MaxPool2D)     │ (None, 8, 8, 256)      │             0 │
│ global_average_pooling2d (GAP)  │ (None, 256)            │             0 │
│ dense (Dense)                   │ (None, 256)            │        65,792 │
│ dropout (Dropout)               │ (None, 256)            │             0 │
│ dense_1 (Dense)                 │ (None, 23)             │         5,911 │
└─────────────────────────────────┴────────────────────────┴───────────────┘
 Total params: 1,384,199 (5.28 MB)
 Trainable params: 461,079 (1.76 MB)
 Non-trainable params: 960 (3.75 KB)
 Optimizer params: 922,160 (3.52 MB)
```

### Verification Results

| Check | Expected | Actual | Status |
|-------|----------|--------|--------|
| Input shape | `(None, 128, 128, 3)` | `(None, 128, 128, 3)` | ✅ |
| Output shape | `(None, 23)` | `(None, 23)` | ✅ |
| Final activation | softmax | softmax | ✅ |
| Rescaling layer present | No | No | ✅ |
| Prob sum on dummy input | ≈ 1.0 | 1.0 | ✅ |
| All probs ≥ 0 | Yes | Yes | ✅ |

### Architecture Confirmation

Sequential model with 4 blocks of `Conv2D → BatchNormalization → MaxPooling2D`, followed by `GlobalAveragePooling2D → Dense(256, relu) → Dropout(0.5) → Dense(23, softmax)`.

- Conv2D filters: 32 → 64 → 128 → 256
- Kernel size: 3×3 for all Conv2D layers
- First Conv2D uses `padding='same'` (output 128×128 = input), subsequent Conv2Ds also use `padding='same'`
- MaxPooling2D: 2×2 with stride 2

This matches the architecture described in the documentation (Section 2.3).

**No Rescaling layer found** — confirms that rescaling (`/ 255.0`) must be done explicitly in preprocessing, NOT inside the model. This is consistent with the documented `rescale=1./255` in `ImageDataGenerator`.

---

## 3. Mapping Validation (1.3)

### class_mapping.json Schema

```json
{
    "fish_01": 0,
    "fish_02": 1,
    ...
    "fish_23": 22
}
```

**Schema:** `name → index` (string key → integer value)
**Direction for inference:** Must invert to `index → name`

| Check | Expected | Actual | Status |
|-------|----------|--------|--------|
| Number of classes | 23 | 23 | ✅ |
| Label format | `fish_01` … `fish_23` | `fish_01` … `fish_23` | ✅ |
| Index range | 0–22 (no gaps) | 0–22 (no gaps) | ✅ |
| All indices unique | Yes | Yes | ✅ |
| Alphabetical = numerical | Yes (zero-padded) | Yes | ✅ |

### model_config.json Schema

```json
{
    "model_name": "AI Fish Image Classifier",
    "architecture": "Custom CNN",
    "image_size": [128, 128],
    "color_mode": "RGB",
    "num_classes": 23,
    "normalization": "rescale 1./255",
    "model_file": "best_fish_cnn.keras"
}
```

| Check | model_config.json | Model actual | Status |
|-------|-------------------|--------------|--------|
| Image size | [128, 128] | (128, 128) input | ✅ |
| Color mode | RGB | 3 channels | ✅ |
| Num classes | 23 | 23 output units | ✅ |
| Normalization | rescale 1./255 | No Rescaling layer (external) | ✅ |
| Model file | best_fish_cnn.keras | File exists, loads | ✅ |

**Note:** `model_config.json` does not include an `interpolation` field. This is a gap — will use `nearest` as default (see Section 4).

---

## 4. Preprocessing Audit (1.4)

### Training Preprocessing (from documentation)

The documentation states the model was trained using Keras `ImageDataGenerator` with:
- `target_size=(128, 128)`
- `color_mode='rgb'`
- `rescale=1./255`
- No explicit `interpolation` parameter mentioned

### Interpolation Analysis

Keras `flow_from_directory` **default interpolation is `"nearest"`** in older Keras versions. However:

> ⚠️ **ASSUMPTION A1:** Since no training notebook is available, we assumed `nearest` interpolation (Keras default).

#### Verifikasi Empiris Asumsi A1 (Fase 9)

Pengujian komparatif dijalankan terhadap 142 citra dari `sample_images/` (mencakup seluruh 23 kelas, minimal 6 per kelas, dan seluruh citra test dari kelas minoritas `fish_18`, `fish_20`, `fish_21`):

| Metode Interpolasi | Akurasi pada Sampel | Jumlah Benar | Jumlah Salah | Catatan |
|---|---|---|---|---|
| **NEAREST** | **95,07%** | 135 / 142 | 7 | **Terpilih.** Konsisten dengan Keras flow_from_directory |
| **BILINEAR** | 94,37% | 134 / 142 | 8 | Memiliki 1 kesalahan tambahan pada `fish_06` (diprediksi `fish_09`) |

*Catatan penting:* Angka ini adalah perbandingan komparatif perlakuan prapemrosesan pada subset sampel terstratifikasi untuk memverifikasi asumsi A1, **bukan bukti akurasi model secara keseluruhan** (metrik performa resmi model tetap mengacu pada `evaluation_summary.json` dan hasil evaluasi set uji 4.109 sampel).

**Daftar Kesalahan Prediksi pada NEAREST (7 citra):**
1. `fish_003825666156_11874.png`: kelas asli `fish_10`, diprediksi `fish_01` (keyakinan 96,3%)
2. `fish_001348000118_01315.png`: kelas asli `fish_18`, diprediksi `fish_08` (keyakinan 57,2%)
3. `fish_004548357375_11256.png`: kelas asli `fish_20`, diprediksi `fish_06` (keyakinan 99,7%)
4. `fish_004131656765_26217.png`: kelas asli `fish_21`, diprediksi `fish_01` (keyakinan 99,8%)
5. `fish_004543607366_23109.png`: kelas asli `fish_21`, diprediksi `fish_01` (keyakinan 99,7%)
6. `fish_000023840001_02333.png`: kelas asli `fish_21`, diprediksi `fish_01` (keyakinan 98,3%)
7. `fish_004350997079_14060.png`: kelas asli `fish_21`, diprediksi `fish_01` (keyakinan 60,8%)

*Analisis:* Kelas `fish_21` menyumbang 4 dari 7 kesalahan, yang konsisten dengan data audit bahwa `fish_21` adalah kelas paling minoritas dengan support uji hanya 3 sampel dan F1-score 0,50. Kesalahan pada `fish_18` dan `fish_20` juga konsisten dengan keterbatasan sampel uji minoritas. Kesimpulan: **`nearest` dikonfirmasi sebagai interpolasi default terbaik.**

### Inference Preprocessing Pipeline (to implement)

1. Read bytes → open with PIL
2. Set `Image.MAX_IMAGE_PIXELS` from config; `img.verify()` then reopen
3. Apply `ImageOps.exif_transpose` (conscious decision: dataset has no EXIF, so no parity impact)
4. Convert to **RGB** (RGBA → composite on white background → RGB)
5. Resize to **128×128** with `Image.NEAREST` interpolation
6. `np.asarray(..., dtype=np.float32) / 255.0` → add batch dimension → `(1, 128, 128, 3)`

### Key Decisions

| Decision | Rationale |
|----------|-----------|
| Use `Image.NEAREST` | Matches Keras `flow_from_directory` default; to be verified in parity test |
| No double rescaling | Model has no Rescaling layer; apply `/ 255.0` once in preprocessing |
| EXIF transpose | Added for real-world photos; dataset was not affected by this |
| RGBA → white composite | Prevents alpha channel from corrupting RGB values |

---

## 5. Evaluation Results Audit (1.5)

### Overall Metrics

| Metric | Expected (from docs) | Actual (from CSV) | Status |
|--------|---------------------|-------------------|--------|
| Accuracy | ≈ 99.17% | 99.1725% | ✅ |
| Macro F1 | ≈ 93.61% | 93.6060% | ✅ |
| Weighted F1 | ≈ 99.16% | 99.1614% | ✅ |

### Weakest Classes (by recall and support)

| Class | Precision | Recall | F1-Score | Support | Notes |
|-------|-----------|--------|----------|---------|-------|
| `fish_21` | 1.000 | 0.333 | 0.500 | 3 | Very low recall, tiny support |
| `fish_20` | 0.667 | 0.667 | 0.667 | 3 | Low F1, tiny support |
| `fish_18` | 0.875 | 0.875 | 0.875 | 8 | Below average, small support |
| `fish_11` | 0.867 | 0.929 | 0.897 | 14 | Below average |
| `fish_14` | 1.000 | 0.857 | 0.923 | 14 | Below average recall |

### Strong Classes (perfect F1)

`fish_05`, `fish_13`, `fish_16`, `fish_19`, `fish_22`, `fish_23` — all have F1 = 1.000

### Confusion Matrix Notable Errors

- `fish_21`: 2 of 3 samples misclassified as `fish_01`
- `fish_20`: 1 of 3 misclassified as `fish_06`
- `fish_18`: 1 of 8 misclassified as `fish_08`

**Conclusion:** Performance is dominated by the large `fish_01` class (1,820 samples). Minority classes with ≤10 test samples show unreliable metrics. This must be communicated transparently in the UI (Brief 02).

---

## 6. Assumptions and Risks

### Assumptions

| ID | Assumption | Impact if Wrong | Mitigation |
|----|-----------|-----------------|------------|
| A1 | Training used `nearest` interpolation (Keras default) | Preprocessing mismatch → accuracy degradation | **Terverifikasi (Fase 9):** `nearest` (95,07%) terbukti lebih unggul dari `bilinear` (94,37%) pada 142 sampel |
| A2 | Training used PIL/Pillow for image loading (via Keras `load_img`) | Different decoder → different pixel values | Standard Keras pipeline uses PIL; low risk |
| A3 | No data augmentation at test time | Augmentation at inference would change results | Confirmed by docs: augmentation only on train |

### Risks

| ID | Risk | Severity | Status |
|----|------|----------|--------|
| R1 | No test images available for parity test | Medium | Will use generated/synthetic images; mark as open risk |
| R2 | Keras version pinning — model requires ≥3.13.2 | Low | Pin in requirements.txt |
| R3 | TF 2.20.0 is very new; may have compatibility issues | Low | Monitor; test thoroughly |
| R4 | `quantization_config=None` in saved model — no actual quantization applied | Info | Cosmetic; model loads fine with matching Keras |
| R5 | `model_config.json` lacks interpolation field | Medium | Add to backend config with `nearest` default |

---

## 7. Technical Plan (Fase 2–4)

### Fase 2 — Repository Foundation
1. Create full directory structure per brief
2. Copy model artifacts to `backend/models/`
3. Create `requirements.txt` pinned to working versions (TF 2.20.0, Keras 3.13.2)
4. Set up ruff config, Makefile, README
5. Create `frontend/` placeholder

### Fase 3 — Backend + Database
1. FastAPI app with lifespan (model load once at startup)
2. Pydantic-settings config from env vars
3. Preprocessing service (exact pipeline from Section 4)
4. Image validation service
5. All 8 endpoints per brief spec
6. SQLAlchemy 2.x + Alembic (predictions + feedback tables)
7. Error handling, CORS, logging middleware

### Fase 4 — Testing
1. Preprocessing parity test (synthetic images, nearest interpolation)
2. Unit tests: mapping, validation, model checks
3. API integration tests: all endpoints, all error cases
4. Smoke test with real model
5. Manual curl verification

---

## Laporan Fase 1 — Audit Aset

**Dibuat/diubah:**
- `docs/artifact-manifest.md`
- `docs/audit-report.md` (this file)

**Pengujian yang dijalankan:**
- Model loading with TF 2.20.0 + Keras 3.13.2: ✅ Success
- Model summary inspection: ✅ Matches documentation
- Dummy inference (random input): ✅ Shape (1,23), sum=1.0, all ≥ 0
- class_mapping.json validation: ✅ 23 classes, 0-22, fish_01-fish_23
- model_config.json validation: ✅ Consistent with model
- classification_report.csv metrics: ✅ Match documented values

**Git:** Branch `chore/phase-0-setup` (Fase 0 commits included; Fase 1 docs will be on `docs/phase-1-audit`)

**Keputusan teknis & asumsi:**
- Keras upgraded from 3.12.0 → 3.13.2 to match model save version
- Assumed `nearest` interpolation (A1)
- Model file is 5.36 MB — will be committed directly (no LFS)
- `.agents/` and `.claude/` folders gitignored (not shared to repo)

**Masalah / risiko terbuka:**
- R1: No sample_images for parity test
- R5: model_config.json lacks interpolation field
- A1: Interpolation assumption needs verification

**Siap lanjut?** Ya — pending project owner approval at STOP GATE 1.

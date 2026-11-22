import React, { useRef, useEffect, useCallback } from "react";
import {
  RotateCcw,
  Zap,
  ShieldCheck,
  AlertTriangle,
  WifiOff,
  Loader2,
} from "lucide-react";
import Layout from "../components/layout/Layout.jsx";
import DropZone from "../components/upload/DropZone.jsx";
import ImagePreview from "../components/upload/ImagePreview.jsx";
import ResultCard from "../components/results/ResultCard.jsx";
import FeedbackForm from "../components/feedback/FeedbackForm.jsx";
import { usePrediction } from "../hooks/usePrediction.js";

export default function KlasifikasiPage({ backendStatus, modelInfo }) {
  const { state, selectFile, predict, reset } = usePrediction();
  const resultRef = useRef(null);
  const liveRef = useRef(null);

  const { phase, file, previewUrl, result, error } = state;

  const limits = modelInfo?.limits ?? null;
  const perClassMetrics = modelInfo?.per_class_metrics ?? null;

  // Move focus to results when they appear
  useEffect(() => {
    if (phase === "success" && resultRef.current) {
      resultRef.current.focus();
    }
  }, [phase]);

  // Announce status changes to screen readers
  useEffect(() => {
    if (!liveRef.current) return;
    if (phase === "predicting") {
      liveRef.current.textContent = "Sedang memproses gambar…";
    } else if (phase === "success") {
      const cls = result?.predicted_class ?? "";
      liveRef.current.textContent = `Hasil: ${cls}`;
    } else if (phase === "error") {
      liveRef.current.textContent = error?.message ?? "Terjadi kesalahan.";
    } else {
      liveRef.current.textContent = "";
    }
  }, [phase, result, error]);

  const canClassify =
    phase === "selected" &&
    backendStatus === "ok";

  // Skeleton while predicting
  const SkeletonResult = () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      <div className="skeleton" style={{ height: "28px", width: "60%" }} />
      <div className="skeleton" style={{ height: "80px" }} />
      <div className="skeleton" style={{ height: "16px", width: "80%" }} />
      <div className="skeleton" style={{ height: "16px", width: "70%" }} />
      <div className="skeleton" style={{ height: "16px", width: "75%" }} />
    </div>
  );

  return (
    <Layout>
      {/* SR live region */}
      <div
        ref={liveRef}
        aria-live="polite"
        aria-atomic="true"
        className="visually-hidden"
      />

      <div className="container" style={{ padding: "2rem 1rem 3rem" }}>
        {/* Page header */}
        <div style={{ marginBottom: "1.75rem" }}>
          <h1
            style={{
              fontSize: "var(--font-size-2xl)",
              fontWeight: "var(--font-weight-bold)",
              marginBottom: "0.375rem",
            }}
          >
            Klasifikasi Ikan
          </h1>
          <p style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-muted)" }}>
            Unggah foto ikan untuk mendapatkan prediksi kelas dari model CNN.
          </p>
        </div>

        {/* Backend not reachable banner */}
        {backendStatus === "error" && (
          <div className="alert alert-danger" role="alert" style={{ marginBottom: "1.25rem" }}>
            <WifiOff size={18} style={{ flexShrink: 0 }} />
            <div>
              <strong>Server tidak dapat dihubungi.</strong> Pastikan backend berjalan, lalu coba lagi.
            </div>
          </div>
        )}
        {backendStatus === "model_not_loaded" && (
          <div className="alert alert-warning" role="alert" style={{ marginBottom: "1.25rem" }}>
            <AlertTriangle size={18} style={{ flexShrink: 0 }} />
            <div>
              <strong>Model belum dimuat.</strong> Klasifikasi tidak tersedia saat ini; coba lagi sebentar lagi.
            </div>
          </div>
        )}

        {/* Two-column layout */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "1.5rem",
            alignItems: "start",
          }}
        >
          {/* LEFT — Upload panel */}
          <div className="card">
            <h2
              style={{
                fontSize: "var(--font-size-lg)",
                fontWeight: "var(--font-weight-semibold)",
                marginBottom: "0.5rem",
              }}
            >
              Unggah Gambar Ikan
            </h2>
            <p
              style={{
                fontSize: "var(--font-size-sm)",
                color: "var(--color-text-muted)",
                marginBottom: "1.25rem",
              }}
            >
              Format: JPG, PNG, WebP — Maks. {limits?.max_upload_mb ?? 5} MB
            </p>

            {/* Show dropzone only when idle/no file, or show preview */}
            {phase === "idle" || phase === "error" ? (
              <DropZone
                onFileSelect={selectFile}
                limits={limits}
                disabled={backendStatus !== "ok" && backendStatus !== "loading"}
              />
            ) : (
              <ImagePreview
                file={file}
                previewUrl={previewUrl}
                onReplace={reset}
                onRemove={reset}
              />
            )}

            {/* Action buttons */}
            <div
              style={{
                marginTop: "1.25rem",
                display: "flex",
                gap: "0.75rem",
                flexWrap: "wrap",
              }}
            >
              <button
                type="button"
                className="btn btn-primary"
                onClick={predict}
                disabled={!canClassify || phase === "predicting"}
                aria-disabled={!canClassify || phase === "predicting"}
                style={{ flex: 1, justifyContent: "center" }}
              >
                {phase === "predicting" ? (
                  <>
                    <span className="spinner" aria-hidden="true" />
                    Memproses…
                  </>
                ) : (
                  <>
                    <Zap size={16} />
                    Klasifikasikan
                  </>
                )}
              </button>

              {phase !== "idle" && (
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={reset}
                  aria-label="Reset, kembali ke kondisi awal"
                >
                  <RotateCcw size={16} />
                  Reset
                </button>
              )}
            </div>

            {/* Privacy note */}
            <div
              style={{
                marginTop: "1rem",
                display: "flex",
                alignItems: "flex-start",
                gap: "0.5rem",
                fontSize: "var(--font-size-xs)",
                color: "var(--color-text-subtle)",
              }}
            >
              <ShieldCheck size={14} color="var(--color-success)" style={{ flexShrink: 0, marginTop: "1px" }} />
              <span>
                Gambar diproses sementara di memori dan tidak disimpan permanen di server.
                Riwayat hanya menyimpan hasil prediksi (label dan keyakinan), terikat pada browser ini.
              </span>
            </div>
          </div>

          {/* RIGHT — Result panel */}
          <div className="card">
            {phase === "idle" && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  minHeight: "260px",
                  textAlign: "center",
                  gap: "1rem",
                  color: "var(--color-text-muted)",
                }}
              >
                <div
                  style={{
                    width: "64px",
                    height: "64px",
                    borderRadius: "var(--radius-full)",
                    backgroundColor: "var(--color-bg)",
                    border: "2px dashed var(--color-border-hover)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "var(--color-border-hover)",
                  }}
                >
                  <Zap size={28} strokeWidth={1.5} />
                </div>
                <div>
                  <p style={{ fontWeight: "var(--font-weight-medium)", marginBottom: "0.25rem" }}>
                    Hasil analisis akan muncul di sini
                  </p>
                  <p style={{ fontSize: "var(--font-size-sm)" }}>
                    Unggah gambar dan klik &quot;Klasifikasikan&quot;
                  </p>
                </div>
              </div>
            )}

            {phase === "selected" && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  minHeight: "260px",
                  textAlign: "center",
                  gap: "1rem",
                  color: "var(--color-text-muted)",
                }}
              >
                <div
                  style={{
                    width: "64px",
                    height: "64px",
                    borderRadius: "var(--radius-full)",
                    backgroundColor: "var(--color-primary-light)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "var(--color-primary)",
                  }}
                >
                  <Zap size={28} />
                </div>
                <div>
                  <p style={{ fontWeight: "var(--font-weight-medium)", marginBottom: "0.25rem", color: "var(--color-text-main)" }}>
                    Gambar siap diklasifikasikan
                  </p>
                  <p style={{ fontSize: "var(--font-size-sm)" }}>
                    Klik tombol &quot;Klasifikasikan&quot; di sebelah kiri.
                  </p>
                </div>
              </div>
            )}

            {phase === "predicting" && <SkeletonResult />}

            {phase === "success" && result && (
              <>
                <ResultCard
                  result={result}
                  perClassMetrics={perClassMetrics}
                  focusRef={resultRef}
                />
                <FeedbackForm predictionId={result.prediction_id} />
              </>
            )}

            {phase === "error" && error && (
              <div>
                <div className="alert alert-danger" role="alert">
                  <AlertTriangle size={18} style={{ flexShrink: 0 }} />
                  <div>
                    <strong>Gagal melakukan klasifikasi.</strong>
                    <div style={{ marginTop: "0.25rem" }}>{error.message}</div>
                    {error.requestId && (
                      <details style={{ marginTop: "0.5rem" }}>
                        <summary style={{ fontSize: "var(--font-size-xs)", cursor: "pointer" }}>
                          Detail teknis
                        </summary>
                        <code style={{ fontSize: "var(--font-size-xs)" }}>
                          request_id: {error.requestId}
                        </code>
                      </details>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={predict}
                  style={{ marginTop: "1rem" }}
                >
                  Coba Lagi
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

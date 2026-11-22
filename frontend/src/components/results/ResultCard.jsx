import { AlertTriangle, Info, Clock } from "lucide-react";
import ProbabilityBar from "./ProbabilityBar.jsx";
import { LOW_CONFIDENCE_THRESHOLD, SMALL_SUPPORT_THRESHOLD } from "../../config/thresholds.js";

export default function ResultCard({ result, perClassMetrics, focusRef }) {
  const {
    predicted_class,
    confidence,
    top5,
    inference_ms,
    prediction_id: _prediction_id,
  } = result;

  const confidencePct = (confidence * 100).toLocaleString("id-ID", {
    maximumFractionDigits: 1,
  }) + "%";

  // Check heuristic warnings
  const isLowConf = confidence < LOW_CONFIDENCE_THRESHOLD;
  const classMetric = perClassMetrics?.find((m) => m.class_name === predicted_class);
  const isSmallSupport = classMetric && classMetric.support <= SMALL_SUPPORT_THRESHOLD;

  return (
    <div ref={focusRef} tabIndex={-1} style={{ outline: "none" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "1rem",
        }}
      >
        <h2
          style={{
            fontSize: "var(--font-size-xl)",
            fontWeight: "var(--font-weight-semibold)",
          }}
        >
          Hasil Analisis
        </h2>
        {inference_ms != null && (
          <span
            style={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
              fontSize: "var(--font-size-xs)",
              color: "var(--color-text-subtle)",
            }}
          >
            <Clock size={12} />
            {inference_ms.toFixed(0)} ms
          </span>
        )}
      </div>

      {/* Main Prediction Highlight */}
      <div
        style={{
          background: isLowConf
            ? "var(--color-warning-bg)"
            : "linear-gradient(135deg, var(--color-primary-light) 0%, #e0f7f4 100%)",
          border: `1px solid ${isLowConf ? "var(--color-warning-border)" : "#BAE6FD"}`,
          borderRadius: "var(--radius-lg)",
          padding: "1.25rem",
          marginBottom: "1.25rem",
        }}
      >
        <div
          style={{
            fontSize: "var(--font-size-xs)",
            color: isLowConf ? "var(--color-warning-text)" : "var(--color-primary)",
            fontWeight: "var(--font-weight-medium)",
            marginBottom: "0.25rem",
          }}
        >
          Label Kelas Prediksi
        </div>
        <div
          style={{
            fontSize: "2.25rem",
            fontWeight: "var(--font-weight-bold)",
            fontFamily: "var(--font-family-mono)",
            color: isLowConf ? "var(--color-warning-text)" : "var(--color-primary-hover)",
            lineHeight: 1.2,
            marginBottom: "0.75rem",
          }}
        >
          {predicted_class}
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            flexWrap: "wrap",
          }}
        >
          <span
            style={{
              fontSize: "var(--font-size-sm)",
              color: "var(--color-text-muted)",
            }}
          >
            Tingkat keyakinan model:
          </span>
          <span
            style={{
              fontSize: "var(--font-size-xl)",
              fontWeight: "var(--font-weight-bold)",
              color: isLowConf ? "var(--color-warning)" : "var(--color-success)",
            }}
          >
            {confidencePct}
          </span>
        </div>
      </div>

      {/* Conditional Warnings */}
      {isLowConf && (
        <div className="alert alert-warning" style={{ marginBottom: "0.75rem" }}>
          <AlertTriangle size={16} style={{ flexShrink: 0 }} />
          <span>
            <strong>Keyakinan rendah (heuristik):</strong> Keyakinan model di bawah ambang{" "}
            {(LOW_CONFIDENCE_THRESHOLD * 100).toFixed(0)}%; hasil mungkin kurang tepat.
          </span>
        </div>
      )}
      {isSmallSupport && (
        <div className="alert alert-warning" style={{ marginBottom: "0.75rem" }}>
          <AlertTriangle size={16} style={{ flexShrink: 0 }} />
          <span>
            <strong>Sampel uji terbatas (heuristik):</strong> Kelas{" "}
            <code>{predicted_class}</code> memiliki hanya {classMetric.support} sampel uji —
            performanya kurang teruji.
          </span>
        </div>
      )}

      {/* Top 5 */}
      <h3
        style={{
          fontSize: "var(--font-size-base)",
          fontWeight: "var(--font-weight-semibold)",
          marginBottom: "0.75rem",
          color: "var(--color-text-main)",
        }}
      >
        Top 5 Probabilitas Tertinggi
      </h3>
      <div
        style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "1.25rem" }}
        aria-label="Lima kelas dengan probabilitas tertinggi"
      >
        {top5.map((item, idx) => (
          <ProbabilityBar
            key={item.class_name}
            label={item.class_name}
            value={item.confidence}
            isTop={idx === 0}
            rank={idx + 1}
          />
        ))}
      </div>

      {/* Context Note */}
      <div className="alert alert-info">
        <Info size={15} style={{ flexShrink: 0 }} />
        <span style={{ fontSize: "var(--font-size-xs)" }}>
          Label <code>fish_01</code>–<code>fish_23</code> adalah label kelas dari struktur folder
          dataset, <strong>bukan</strong> nama spesies yang sudah diverifikasi. Tingkat keyakinan
          adalah keluaran softmax model; angka tinggi tidak menjamin prediksi benar.
        </span>
      </div>
    </div>
  );
}

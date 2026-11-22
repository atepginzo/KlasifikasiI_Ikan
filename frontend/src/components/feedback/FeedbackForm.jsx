import React, { useState } from "react";
import { ThumbsUp, ThumbsDown, ChevronDown, CheckCircle2, AlertCircle } from "lucide-react";
import { sendFeedback } from "../../services/api.js";

const FISH_LABELS = Array.from({ length: 23 }, (_, i) => `fish_${String(i + 1).padStart(2, "0")}`);

export default function FeedbackForm({ predictionId }) {
  const [feedbackState, setFeedbackState] = useState("idle"); // idle | correct | incorrect | submitting | done | error
  const [correctedClass, setCorrectedClass] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  if (!predictionId) return null;

  const handleCorrect = async () => {
    setSubmitting(true);
    setErrorMsg(null);
    try {
      await sendFeedback(predictionId, { is_correct: true });
      setSubmitted(true);
      setFeedbackState("done_correct");
    } catch (e) {
      setErrorMsg(e?.message ?? "Gagal mengirim umpan balik.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleIncorrect = () => {
    setFeedbackState("incorrect");
  };

  const handleSubmitIncorrect = async () => {
    setSubmitting(true);
    setErrorMsg(null);
    try {
      const payload = {
        is_correct: false,
        ...(correctedClass ? { corrected_class: correctedClass } : {}),
      };
      await sendFeedback(predictionId, payload);
      setSubmitted(true);
      setFeedbackState("done_incorrect");
    } catch (e) {
      setErrorMsg(e?.message ?? "Gagal mengirim umpan balik.");
    } finally {
      setSubmitting(false);
    }
  };

  if (feedbackState === "done_correct" || feedbackState === "done_incorrect") {
    return (
      <div className="alert alert-success" style={{ marginTop: "1rem" }}>
        <CheckCircle2 size={16} style={{ flexShrink: 0 }} />
        <span>
          Terima kasih atas umpan balik Anda!{" "}
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => { setFeedbackState("idle"); setSubmitted(false); setCorrectedClass(""); }}
            style={{ padding: "0 4px", minHeight: "auto" }}
          >
            Ubah
          </button>
        </span>
      </div>
    );
  }

  return (
    <div
      style={{
        marginTop: "1rem",
        padding: "1rem",
        background: "var(--color-bg)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-md)",
      }}
    >
      <p
        style={{
          fontSize: "var(--font-size-sm)",
          color: "var(--color-text-muted)",
          marginBottom: "0.75rem",
        }}
      >
        Apakah prediksi ini sesuai menurut Anda?
      </p>

      {feedbackState === "idle" && (
        <div style={{ display: "flex", gap: "0.625rem" }}>
          <button
            type="button"
            className="btn btn-success btn-sm"
            onClick={handleCorrect}
            disabled={submitting}
          >
            <ThumbsUp size={14} />
            Prediksi Benar
          </button>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={handleIncorrect}
            style={{ color: "var(--color-danger)", borderColor: "var(--color-danger-border)" }}
          >
            <ThumbsDown size={14} />
            Prediksi Salah
          </button>
        </div>
      )}

      {feedbackState === "incorrect" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
            <label
              htmlFor="corrected-class"
              style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-muted)" }}
            >
              Kelas yang benar (opsional):
            </label>
            <select
              id="corrected-class"
              value={correctedClass}
              onChange={(e) => setCorrectedClass(e.target.value)}
              style={{
                padding: "0.3rem 0.6rem",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--color-border)",
                fontSize: "var(--font-size-sm)",
                fontFamily: "var(--font-family-mono)",
                backgroundColor: "var(--color-surface)",
                color: "var(--color-text-main)",
                cursor: "pointer",
              }}
            >
              <option value="">-- Lewati --</option>
              {FISH_LABELS.map((lbl) => (
                <option key={lbl} value={lbl}>
                  {lbl}
                </option>
              ))}
            </select>
          </div>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button
              type="button"
              className="btn btn-danger btn-sm"
              onClick={handleSubmitIncorrect}
              disabled={submitting}
            >
              {submitting ? "Mengirim…" : "Kirim Umpan Balik"}
            </button>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => setFeedbackState("idle")}
              disabled={submitting}
            >
              Batal
            </button>
          </div>
        </div>
      )}

      {errorMsg && (
        <div className="alert alert-danger" role="alert" style={{ marginTop: "0.5rem" }}>
          <AlertCircle size={14} style={{ flexShrink: 0 }} />
          <span>{errorMsg}</span>
        </div>
      )}
    </div>
  );
}

import React from "react";
import { X, RefreshCcw, FileImage } from "lucide-react";

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export default function ImagePreview({ file, previewUrl, onReplace, onRemove }) {
  if (!file || !previewUrl) return null;

  return (
    <div
      style={{
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-xl)",
        overflow: "hidden",
        background: "var(--color-surface)",
        boxShadow: "var(--shadow-sm)",
      }}
    >
      {/* Image */}
      <div
        style={{
          position: "relative",
          backgroundColor: "#0f172a",
          maxHeight: "280px",
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <img
          src={previewUrl}
          alt="Pratinjau gambar yang akan diklasifikasi"
          style={{
            width: "100%",
            maxHeight: "280px",
            objectFit: "contain",
            display: "block",
          }}
        />
      </div>

      {/* File metadata + actions */}
      <div
        style={{
          padding: "0.875rem 1rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "0.75rem",
          flexWrap: "wrap",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.625rem",
            minWidth: 0,
          }}
        >
          <FileImage size={18} color="var(--color-primary)" style={{ flexShrink: 0 }} />
          <div style={{ minWidth: 0 }}>
            <div
              className="truncate"
              style={{
                fontSize: "var(--font-size-sm)",
                fontWeight: "var(--font-weight-medium)",
                maxWidth: "220px",
              }}
              title={file.name}
            >
              {file.name}
            </div>
            <div
              style={{
                fontSize: "var(--font-size-xs)",
                color: "var(--color-text-muted)",
              }}
            >
              {formatBytes(file.size)}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: "0.5rem", flexShrink: 0 }}>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={onReplace}
            aria-label="Ganti gambar"
          >
            <RefreshCcw size={14} />
            Ganti
          </button>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={onRemove}
            aria-label="Hapus gambar"
            style={{ color: "var(--color-danger)" }}
          >
            <X size={14} />
            Hapus
          </button>
        </div>
      </div>
    </div>
  );
}

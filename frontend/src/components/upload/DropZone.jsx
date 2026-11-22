import React, { useCallback, useRef, useState } from "react";
import { Upload, Image as ImageIcon } from "lucide-react";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp"];
const DEFAULT_MAX_MB = 5;

function validateFile(file, limits) {
  const maxMb = limits?.max_upload_mb ?? DEFAULT_MAX_MB;
  const allowedTypes = limits?.allowed_types ?? ALLOWED_TYPES;

  if (!allowedTypes.includes(file.type)) {
    return "Format tidak didukung. Gunakan JPG, PNG, atau WebP.";
  }
  if (file.size > maxMb * 1024 * 1024) {
    return `Ukuran melebihi ${maxMb} MB.`;
  }
  return null;
}

export default function DropZone({ onFileSelect, limits, disabled }) {
  const [dragOver, setDragOver] = useState(false);
  const [validationError, setValidationError] = useState(null);
  const inputRef = useRef(null);

  const handleFile = useCallback(
    (file) => {
      if (!file) return;
      const error = validateFile(file, limits);
      if (error) {
        setValidationError(error);
        return;
      }
      setValidationError(null);
      onFileSelect(file);
    },
    [limits, onFileSelect]
  );

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      setDragOver(false);
      const files = Array.from(e.dataTransfer.files);
      if (files.length > 1) {
        setValidationError("Hanya satu file yang dapat diproses sekaligus; file pertama diambil.");
      } else {
        setValidationError(null);
      }
      handleFile(files[0]);
    },
    [handleFile]
  );

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => setDragOver(false), []);

  const handleInputChange = useCallback(
    (e) => {
      handleFile(e.target.files[0]);
      e.target.value = "";
    },
    [handleFile]
  );

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        inputRef.current?.click();
      }
    },
    []
  );

  return (
    <div>
      <div
        className={`dropzone${dragOver ? " drag-over" : ""}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => !disabled && inputRef.current?.click()}
        onKeyDown={handleKeyDown}
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-disabled={disabled}
        aria-label="Area unggah gambar ikan — seret dan lepas atau klik untuk memilih"
        style={{
          opacity: disabled ? 0.6 : 1,
          cursor: disabled ? "not-allowed" : "pointer",
        }}
      >
        {/* Upload Icon */}
        <div
          style={{
            width: "72px",
            height: "72px",
            borderRadius: "var(--radius-full)",
            background: dragOver
              ? "var(--color-primary)"
              : "linear-gradient(135deg, var(--color-primary-light) 0%, var(--color-secondary-light) 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 1.25rem",
            transition: "all var(--transition-normal)",
            color: dragOver ? "white" : "var(--color-primary)",
          }}
        >
          <Upload size={32} strokeWidth={1.5} />
        </div>

        <p
          style={{
            fontWeight: "var(--font-weight-semibold)",
            fontSize: "var(--font-size-base)",
            marginBottom: "0.375rem",
            color: dragOver ? "var(--color-primary)" : "var(--color-text-main)",
          }}
        >
          {dragOver ? "Lepaskan gambar di sini…" : "Seret dan lepas gambar ke sini"}
        </p>
        <p
          style={{
            fontSize: "var(--font-size-sm)",
            color: "var(--color-text-muted)",
            marginBottom: "1.25rem",
          }}
        >
          atau klik untuk memilih dari perangkat Anda
        </p>

        <label
          style={{ cursor: disabled ? "not-allowed" : "pointer" }}
          onClick={(e) => e.stopPropagation()}
        >
          <input
            ref={inputRef}
            type="file"
            accept={ALLOWED_EXTENSIONS.join(",")}
            onChange={handleInputChange}
            disabled={disabled}
            className="visually-hidden"
            aria-label="Pilih file gambar"
          />
          <span className="btn btn-primary btn-sm" aria-hidden="true">
            <ImageIcon size={15} />
            Pilih File Gambar
          </span>
        </label>

        <p
          style={{
            marginTop: "1rem",
            fontSize: "var(--font-size-xs)",
            color: "var(--color-text-subtle)",
          }}
        >
          JPG, PNG, WebP — Maks. {limits?.max_upload_mb ?? DEFAULT_MAX_MB} MB
        </p>
      </div>

      {/* Client-side validation error */}
      {validationError && (
        <div
          className="alert alert-danger"
          role="alert"
          style={{ marginTop: "0.75rem" }}
        >
          <span>{validationError}</span>
        </div>
      )}
    </div>
  );
}

import { Link } from "react-router-dom";
import { Fish, AlertCircle } from "lucide-react";

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer
      style={{
        backgroundColor: "var(--color-surface)",
        borderTop: "1px solid var(--color-border)",
        padding: "2rem 0 1.5rem",
        marginTop: "auto",
      }}
    >
      <div className="container">
        {/* Top row */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "2rem",
            marginBottom: "1.5rem",
          }}
        >
          {/* Brand */}
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginBottom: "0.5rem",
              }}
            >
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "var(--radius-md)",
                  background:
                    "linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                }}
              >
                <Fish size={18} />
              </div>
              <span
                style={{
                  fontWeight: "var(--font-weight-bold)",
                  color: "var(--color-text-main)",
                }}
              >
                AI Fish Classifier
              </span>
            </div>
            <p
              style={{
                fontSize: "var(--font-size-xs)",
                color: "var(--color-text-muted)",
                lineHeight: "var(--line-height-relaxed)",
              }}
            >
              Klasifikasi citra ikan berbasis Convolutional Neural Network.
              Dataset: Fish4Knowledge, 23 kelas.
            </p>
          </div>

          {/* Nav links */}
          <div>
            <div
              style={{
                fontSize: "var(--font-size-xs)",
                fontWeight: "var(--font-weight-semibold)",
                color: "var(--color-text-muted)",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                marginBottom: "0.75rem",
              }}
            >
              Navigasi
            </div>
            {[
              { to: "/", label: "Beranda" },
              { to: "/klasifikasi", label: "Klasifikasi" },
              { to: "/riwayat", label: "Riwayat" },
              { to: "/tentang-model", label: "Tentang Model" },
            ].map((item) => (
              <Link
                key={item.to}
                to={item.to}
                style={{
                  display: "block",
                  fontSize: "var(--font-size-sm)",
                  color: "var(--color-text-muted)",
                  marginBottom: "0.375rem",
                  textDecoration: "none",
                }}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Disclaimer */}
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "var(--font-size-xs)",
                fontWeight: "var(--font-weight-semibold)",
                color: "var(--color-text-muted)",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                marginBottom: "0.75rem",
              }}
            >
              <AlertCircle size={12} />
              Keterbatasan
            </div>
            <p
              style={{
                fontSize: "var(--font-size-xs)",
                color: "var(--color-text-muted)",
                lineHeight: "var(--line-height-relaxed)",
              }}
            >
              Aplikasi ini bukan alat identifikasi lapangan atau diagnosis biologis resmi.
              Label adalah kelas dataset, bukan nama spesies terverifikasi.
            </p>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          style={{
            borderTop: "1px solid var(--color-border)",
            paddingTop: "1rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "0.5rem",
            fontSize: "var(--font-size-xs)",
            color: "var(--color-text-muted)",
          }}
        >
          <span>© {year} AI Fish Image Classifier — v0.2.0</span>
          <span>Model: Custom CNN • TensorFlow 2.20 / Keras 3.13</span>
        </div>
      </div>
    </footer>
  );
}

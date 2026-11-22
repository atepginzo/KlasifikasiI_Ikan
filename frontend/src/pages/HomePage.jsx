import { Link } from "react-router-dom";
import {
  Upload,
  ListChecks,
  BarChart3,
  Zap,
  ShieldCheck,
  Info,
  ArrowRight,
  Fish,
} from "lucide-react";
import Layout from "../components/layout/Layout.jsx";

function WaveSvg() {
  return (
    <svg
      viewBox="0 0 1440 80"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: "block", width: "100%", marginTop: "-1px" }}
      preserveAspectRatio="none"
    >
      <path
        d="M0,40 C240,80 480,0 720,40 C960,80 1200,0 1440,40 L1440,80 L0,80 Z"
        fill="var(--color-bg)"
      />
    </svg>
  );
}

function StepCard({ icon: Icon, num, title, desc }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        padding: "1.5rem 1rem",
        gap: "1rem",
      }}
    >
      <div
        style={{
          position: "relative",
          width: "72px",
          height: "72px",
          borderRadius: "var(--radius-full)",
          background:
            "linear-gradient(135deg, var(--color-primary-light) 0%, var(--color-secondary-light) 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--color-primary)",
          boxShadow: "var(--shadow-md)",
        }}
      >
        <Icon size={28} strokeWidth={1.5} />
        <span
          style={{
            position: "absolute",
            top: "-4px",
            right: "-4px",
            width: "22px",
            height: "22px",
            borderRadius: "var(--radius-full)",
            backgroundColor: "var(--color-primary)",
            color: "white",
            fontSize: "0.7rem",
            fontWeight: "bold",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {num}
        </span>
      </div>
      <div>
        <h3
          style={{
            fontSize: "var(--font-size-base)",
            fontWeight: "var(--font-weight-semibold)",
            marginBottom: "0.375rem",
          }}
        >
          {title}
        </h3>
        <p
          style={{
            fontSize: "var(--font-size-sm)",
            color: "var(--color-text-muted)",
            lineHeight: "var(--line-height-relaxed)",
          }}
        >
          {desc}
        </p>
      </div>
    </div>
  );
}

function FeatureChip({ icon: Icon, label }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
        padding: "0.5rem 1rem",
        background: "rgba(255,255,255,0.15)",
        borderRadius: "var(--radius-full)",
        fontSize: "var(--font-size-sm)",
        backdropFilter: "blur(4px)",
        border: "1px solid rgba(255,255,255,0.2)",
      }}
    >
      <Icon size={15} />
      <span>{label}</span>
    </div>
  );
}

export default function HomePage() {
  return (
    <Layout>
      {/* Hero Section */}
      <section
        style={{
          background:
            "linear-gradient(160deg, var(--color-primary-hover) 0%, var(--color-primary) 40%, var(--color-secondary) 100%)",
          color: "white",
          paddingTop: "3.5rem",
          paddingBottom: 0,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background abstract wave pattern */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "radial-gradient(circle at 20% 50%, rgba(255,255,255,0.08) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.06) 0%, transparent 40%)",
            pointerEvents: "none",
          }}
        />

        <div className="container" style={{ position: "relative", zIndex: 1 }}>
          {/* Badge */}
          <div style={{ marginBottom: "1rem", display: "flex", justifyContent: "center" }}>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.4rem",
                padding: "0.3rem 0.9rem",
                background: "rgba(255,255,255,0.2)",
                borderRadius: "var(--radius-full)",
                fontSize: "var(--font-size-xs)",
                fontWeight: "var(--font-weight-semibold)",
                backdropFilter: "blur(4px)",
                border: "1px solid rgba(255,255,255,0.3)",
              }}
            >
              <Fish size={13} />
              Custom CNN • 23 Kelas Ikan • Fish4Knowledge Dataset
            </span>
          </div>

          {/* Title */}
          <h1
            style={{
              textAlign: "center",
              fontSize: "clamp(1.75rem, 5vw, 2.75rem)",
              fontWeight: "var(--font-weight-bold)",
              lineHeight: "var(--line-height-tight)",
              marginBottom: "1rem",
              textShadow: "0 1px 3px rgba(0,0,0,0.2)",
            }}
          >
            Klasifikasi Citra Ikan
            <br />
            Berbasis Kecerdasan Buatan
          </h1>

          <p
            style={{
              textAlign: "center",
              maxWidth: "600px",
              margin: "0 auto 2rem",
              fontSize: "var(--font-size-base)",
              color: "rgba(255,255,255,0.88)",
              lineHeight: "var(--line-height-relaxed)",
            }}
          >
            Unggah foto ikan untuk mendapatkan prediksi kelas dan tingkat keyakinan model
            secara instan. Didukung model Convolutional Neural Network tervalidasi.
          </p>

          {/* CTA */}
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "2rem" }}>
            <Link to="/klasifikasi" className="btn btn-lg" style={{
              backgroundColor: "white",
              color: "var(--color-primary-hover)",
              border: "none",
              fontWeight: "var(--font-weight-bold)",
              boxShadow: "0 4px 14px rgba(0,0,0,0.2)",
            }}>
              <Zap size={18} />
              Mulai Klasifikasi
              <ArrowRight size={18} />
            </Link>
          </div>

          {/* Feature chips */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "0.625rem",
              justifyContent: "center",
              marginBottom: "2.5rem",
            }}
          >
            <FeatureChip icon={BarChart3} label="Akurasi 99,17% (uji)" />
            <FeatureChip icon={ShieldCheck} label="Tanpa penyimpanan gambar" />
            <FeatureChip icon={ListChecks} label="Top 5 probabilitas" />
          </div>
        </div>

        {/* Wave bottom */}
        <WaveSvg />
      </section>

      {/* How it works */}
      <section style={{ padding: "3rem 0" }}>
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: "2rem" }}>
            <span
              className="badge badge-primary"
              style={{ marginBottom: "0.75rem" }}
            >
              Cara Kerja
            </span>
            <h2
              style={{
                fontSize: "var(--font-size-2xl)",
                fontWeight: "var(--font-weight-bold)",
                marginBottom: "0.5rem",
              }}
            >
              Tiga Langkah Mudah
            </h2>
            <p
              style={{
                fontSize: "var(--font-size-sm)",
                color: "var(--color-text-muted)",
              }}
            >
              Dari unggah gambar hingga hasil prediksi — cepat dan mudah.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "1rem",
            }}
          >
            <StepCard
              num="1"
              icon={Upload}
              title="Unggah Gambar"
              desc="Pilih foto ikan dalam format JPG, PNG, atau WebP (maks. 5 MB). Seret dan lepas atau gunakan tombol pilih."
            />
            <StepCard
              num="2"
              icon={Zap}
              title="Proses Otomatis"
              desc="Model CNN menganalisis gambar secara otomatis — gambar diproses sementara dan tidak disimpan permanen."
            />
            <StepCard
              num="3"
              icon={BarChart3}
              title="Lihat Hasil"
              desc="Dapatkan prediksi kelas, tingkat keyakinan model, dan 5 kelas teratas secara instan."
            />
          </div>
        </div>
      </section>

      {/* Disclaimer Banner */}
      <section style={{ padding: "0 0 3rem" }}>
        <div className="container">
          <div
            className="alert alert-info"
            style={{
              borderRadius: "var(--radius-xl)",
              padding: "1.25rem 1.5rem",
              gap: "1rem",
            }}
          >
            <Info size={20} style={{ flexShrink: 0, marginTop: "1px" }} />
            <div>
              <strong>Keterbatasan penggunaan:</strong> Label{" "}
              <code>fish_01</code>–<code>fish_23</code> adalah label kelas dari struktur folder
              dataset, bukan nama spesies yang sudah diverifikasi. Aplikasi ini bukan alat
              identifikasi lapangan atau diagnosis biologis.{" "}
              <Link to="/tentang-model">Pelajari lebih lanjut →</Link>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}

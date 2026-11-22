import React from "react";
import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Fish,
  Info,
  RotateCcw,
  Sparkles,
  Upload,
} from "lucide-react";

export default function App() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* 1. Navbar */}
      <header
        style={{
          backgroundColor: "var(--color-surface)",
          borderBottom: "1px solid var(--color-border)",
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}
      >
        <div
          className="container"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            height: "64px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "var(--radius-md)",
                backgroundColor: "var(--color-primary-light)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--color-primary)",
              }}
            >
              <Fish size={22} />
            </div>
            <div>
              <span style={{ fontWeight: "var(--font-weight-bold)", fontSize: "1.05rem" }}>
                AI Fish Classifier
              </span>
              <span
                style={{
                  display: "block",
                  fontSize: "var(--font-size-xs)",
                  color: "var(--color-text-muted)",
                  lineHeight: 1,
                }}
              >
                Deep Learning Model
              </span>
            </div>
          </div>

          <nav style={{ display: "flex", gap: "20px", alignItems: "center" }}>
            <span style={{ fontWeight: "var(--font-weight-medium)", color: "var(--color-primary)" }}>
              Beranda
            </span>
            <span style={{ color: "var(--color-text-muted)" }}>Klasifikasi</span>
            <span style={{ color: "var(--color-text-muted)" }}>Riwayat</span>
            <span style={{ color: "var(--color-text-muted)" }}>Tentang Model</span>
          </nav>
        </div>
      </header>

      {/* Main Container */}
      <main className="container" style={{ flex: 1, paddingBottom: "48px" }}>
        {/* Banner Gerbang Desain */}
        <div
          style={{
            margin: "24px 0",
            backgroundColor: "#EFF6FF",
            border: "1px solid #BFDBFE",
            borderRadius: "var(--radius-md)",
            padding: "12px 16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "#1E40AF" }}>
            <Info size={20} />
            <span style={{ fontSize: "var(--font-size-sm)", fontWeight: "var(--font-weight-medium)" }}>
              <strong>STOP GATE 3 PREVIEW:</strong> Halaman pratinjau arah desain statis (tema kelautan, token warna, tipografi, kartu hasil dummy).
            </span>
          </div>
          <span className="badge badge-primary">CONTOH DESAIN</span>
        </div>

        {/* 2. Hero Section */}
        <section style={{ textAlign: "center", padding: "32px 0 24px" }}>
          <div
            className="badge badge-primary"
            style={{ marginBottom: "12px" }}
          >
            <Sparkles size={14} /> Custom CNN 128×128 • 23 Kelas
          </div>
          <h1
            style={{
              fontSize: "var(--font-size-3xl)",
              fontWeight: "var(--font-weight-bold)",
              color: "var(--color-text-main)",
              marginBottom: "12px",
            }}
          >
            Klasifikasi Citra Ikan Berbasis Kecerdasan Buatan
          </h1>
          <p
            style={{
              maxWidth: "680px",
              margin: "0 auto",
              color: "var(--color-text-muted)",
              fontSize: "var(--font-size-base)",
            }}
          >
            Unggah foto ikan untuk mendapatkan prediksi kelas dan tingkat keyakinan model secara instan.
            Didukung model Convolutional Neural Network tervalidasi.
          </p>
        </section>

        {/* 3. Core Layout: 2 Columns on Desktop */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
            gap: "24px",
            marginTop: "16px",
          }}
        >
          {/* Left Column: Dropzone Area */}
          <div className="card">
            <h2
              style={{
                fontSize: "var(--font-size-xl)",
                fontWeight: "var(--font-weight-semibold)",
                marginBottom: "8px",
              }}
            >
              Unggah Gambar Ikan
            </h2>
            <p
              style={{
                fontSize: "var(--font-size-sm)",
                color: "var(--color-text-muted)",
                marginBottom: "20px",
              }}
            >
              Format yang didukung: JPG, PNG, atau WebP (maks. 5 MB).
            </p>

            {/* Dropzone Container */}
            <div
              style={{
                border: "2px dashed var(--color-border)",
                borderRadius: "var(--radius-lg)",
                padding: "40px 20px",
                textAlign: "center",
                backgroundColor: "var(--color-bg)",
                cursor: "pointer",
                transition: "border-color var(--transition-fast)",
              }}
            >
              <div
                style={{
                  width: "56px",
                  height: "56px",
                  borderRadius: "var(--radius-full)",
                  backgroundColor: "var(--color-primary-light)",
                  color: "var(--color-primary)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 16px",
                }}
              >
                <Upload size={28} />
              </div>
              <p style={{ fontWeight: "var(--font-weight-semibold)", marginBottom: "4px" }}>
                Seret dan lepas gambar ke sini
              </p>
              <p
                style={{
                  fontSize: "var(--font-size-sm)",
                  color: "var(--color-text-muted)",
                  marginBottom: "16px",
                }}
              >
                atau klik tombol di bawah untuk memilih file dari perangkat Anda
              </p>
              <button type="button" className="btn btn-primary">
                <Upload size={16} /> Pilih File Gambar
              </button>
            </div>

            {/* Privacy note */}
            <div
              style={{
                marginTop: "16px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "var(--font-size-xs)",
                color: "var(--color-text-muted)",
              }}
            >
              <CheckCircle2 size={16} color="var(--color-success)" />
              <span>Gambar diproses sementara di memori dan tidak disimpan permanen di server.</span>
            </div>
          </div>

          {/* Right Column: Result Card (CONTOH) */}
          <div className="card" style={{ position: "relative" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "16px",
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
              <span className="badge badge-warning">CONTOH PREVIEW</span>
            </div>

            {/* Main Result Highlight */}
            <div
              style={{
                padding: "20px",
                backgroundColor: "var(--color-primary-light)",
                borderRadius: "var(--radius-md)",
                border: "1px solid #BAE6FD",
                marginBottom: "20px",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <span style={{ fontSize: "var(--font-size-sm)", color: "var(--color-primary)", fontWeight: "var(--font-weight-medium)" }}>
                  Label Kelas Prediksi:
                </span>
                <span style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>
                  Inference: 70.5 ms
                </span>
              </div>
              <div
                style={{
                  fontSize: "2rem",
                  fontWeight: "var(--font-weight-bold)",
                  color: "var(--color-primary-hover)",
                  fontFamily: "var(--font-family-mono)",
                  margin: "4px 0 8px",
                }}
              >
                fish_01
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-muted)" }}>
                  Tingkat keyakinan model:
                </span>
                <span
                  style={{
                    fontSize: "var(--font-size-lg)",
                    fontWeight: "var(--font-weight-bold)",
                    color: "var(--color-success)",
                  }}
                >
                  99,9%
                </span>
              </div>
            </div>

            {/* Top 5 Probability Bars */}
            <h3
              style={{
                fontSize: "var(--font-size-base)",
                fontWeight: "var(--font-weight-semibold)",
                marginBottom: "12px",
              }}
            >
              Top 5 Probabilitas Tertinggi
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "20px" }}>
              {[
                { label: "fish_01", pct: 99.9, width: "99.9%" },
                { label: "fish_02", pct: 0.1, width: "12%" },
                { label: "fish_05", pct: 0.0, width: "5%" },
                { label: "fish_09", pct: 0.0, width: "3%" },
                { label: "fish_03", pct: 0.0, width: "2%" },
              ].map((item, idx) => (
                <div key={idx}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "var(--font-size-sm)", marginBottom: "4px" }}>
                    <span style={{ fontFamily: "var(--font-family-mono)", fontWeight: idx === 0 ? "bold" : "normal" }}>
                      {idx + 1}. {item.label}
                    </span>
                    <span style={{ color: "var(--color-text-muted)" }}>
                      {item.pct > 0.0 ? `${item.pct.toFixed(1).replace(".", ",")}%` : "<0,1%"}
                    </span>
                  </div>
                  <div
                    style={{
                      height: "8px",
                      backgroundColor: "var(--color-border)",
                      borderRadius: "var(--radius-full)",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        width: item.width,
                        height: "100%",
                        backgroundColor: idx === 0 ? "var(--color-primary)" : "#94A3B8",
                        borderRadius: "var(--radius-full)",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Contextual Warning */}
            <div className="alert alert-warning">
              <AlertTriangle size={18} style={{ flexShrink: 0, marginTop: "2px" }} />
              <div>
                <strong>Catatan Konteks:</strong> Label <code>fish_01</code>–<code>fish_23</code> adalah label kelas dari struktur dataset, bukan nama spesies terverifikasi. Tingkat keyakinan bukan jaminan akurasi mutlak.
              </div>
            </div>

            {/* Feedback & Action Buttons */}
            <div style={{ display: "flex", gap: "12px", alignItems: "center", justifyContent: "space-between" }}>
              <button type="button" className="btn btn-secondary">
                <RotateCcw size={16} /> Reset
              </button>
              <div style={{ display: "flex", gap: "8px" }}>
                <button type="button" className="btn btn-ghost" style={{ fontSize: "var(--font-size-xs)" }}>
                  Prediksi Salah?
                </button>
                <button type="button" className="btn btn-primary" style={{ backgroundColor: "var(--color-success)" }}>
                  <CheckCircle2 size={16} /> Prediksi Benar
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 4. Component Gallery Showcase */}
        <section style={{ marginTop: "40px" }}>
          <h2 style={{ fontSize: "var(--font-size-xl)", fontWeight: "var(--font-weight-semibold)", marginBottom: "16px" }}>
            Pustaka Komponen & Desain UI
          </h2>

          <div className="card" style={{ marginBottom: "24px" }}>
            <h3 style={{ fontSize: "var(--font-size-base)", fontWeight: "var(--font-weight-semibold)", marginBottom: "12px" }}>
              Varian Tombol (Buttons)
            </h3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", alignItems: "center" }}>
              <button type="button" className="btn btn-primary">Primary Action</button>
              <button type="button" className="btn btn-secondary">Secondary Action</button>
              <button type="button" className="btn btn-ghost">Ghost Button</button>
              <button type="button" className="btn btn-danger">Hapus Data</button>
              <button type="button" className="btn btn-primary" disabled>Disabled State</button>
            </div>
          </div>

          <div className="card" style={{ marginBottom: "24px" }}>
            <h3 style={{ fontSize: "var(--font-size-base)", fontWeight: "var(--font-weight-semibold)", marginBottom: "12px" }}>
              Varian Notifikasi & Alert
            </h3>
            <div className="alert alert-info">
              <Info size={18} style={{ flexShrink: 0 }} />
              <span><strong>Info:</strong> Model Convolutional Neural Network dilatih dengan dataset citra ikan Fish4Knowledge (128×128 RGB).</span>
            </div>
            <div className="alert alert-warning">
              <AlertTriangle size={18} style={{ flexShrink: 0 }} />
              <span><strong>Perhatian:</strong> Kelas minoritas (fish_18, fish_20, fish_21) memiliki sampel uji terbatas.</span>
            </div>
            <div className="alert alert-danger">
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <span><strong>Error:</strong> Format file tidak didukung. Mohon gunakan berkas dengan format JPG, PNG, atau WebP.</span>
            </div>
          </div>

          {/* Sample Data Table */}
          <div className="card">
            <h3 style={{ fontSize: "var(--font-size-base)", fontWeight: "var(--font-weight-semibold)", marginBottom: "12px" }}>
              Sampel Tabel Metrik Evaluasi Model
            </h3>
            <div style={{ overflowX: "auto" }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Kelas</th>
                    <th>Precision</th>
                    <th>Recall</th>
                    <th>F1-Score</th>
                    <th>Support (Uji)</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><code>fish_01</code></td>
                    <td>99,2%</td>
                    <td>99,6%</td>
                    <td>99,4%</td>
                    <td>1.820</td>
                    <td><span className="badge badge-success">Sangat Baik</span></td>
                  </tr>
                  <tr>
                    <td><code>fish_04</code></td>
                    <td>99,8%</td>
                    <td>99,7%</td>
                    <td>99,8%</td>
                    <td>608</td>
                    <td><span className="badge badge-success">Sangat Baik</span></td>
                  </tr>
                  <tr>
                    <td><code>fish_18</code></td>
                    <td>87,5%</td>
                    <td>87,5%</td>
                    <td>87,5%</td>
                    <td>8</td>
                    <td><span className="badge badge-warning">Sampel Sedikit</span></td>
                  </tr>
                  <tr>
                    <td><code>fish_21</code></td>
                    <td>100,0%</td>
                    <td>33,3%</td>
                    <td>50,0%</td>
                    <td>3</td>
                    <td><span className="badge badge-danger">Minoritas Rendah</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer
        style={{
          backgroundColor: "var(--color-surface)",
          borderTop: "1px solid var(--color-border)",
          padding: "24px 0",
          fontSize: "var(--font-size-sm)",
          color: "var(--color-text-muted)",
        }}
      >
        <div className="container" style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <strong>AI Fish Image Classifier</strong> v0.1.0 • Proyek Klasifikasi Citra Ikan
          </div>
          <div>
            Aplikasi ini bukan alat identifikasi lapangan atau diagnosis biologis resmi.
          </div>
        </div>
      </footer>
    </div>
  );
}

import React, { useState } from "react";
import {
  BarChart3,
  Info,
  AlertTriangle,
  ChevronUp,
  ChevronDown,
  ArrowUpDown,
} from "lucide-react";
import Layout from "../components/layout/Layout.jsx";
import { SMALL_SUPPORT_THRESHOLD } from "../config/thresholds.js";

function MetricCard({ label, value, sub }) {
  return (
    <div
      style={{
        background: "var(--color-surface)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-xl)",
        padding: "1.25rem 1.5rem",
        textAlign: "center",
        boxShadow: "var(--shadow-sm)",
      }}
    >
      <div
        style={{
          fontSize: "2rem",
          fontWeight: "var(--font-weight-bold)",
          color: "var(--color-primary)",
          lineHeight: 1.2,
          marginBottom: "0.25rem",
        }}
      >
        {value ?? "—"}
      </div>
      <div style={{ fontWeight: "var(--font-weight-semibold)", fontSize: "var(--font-size-sm)" }}>
        {label}
      </div>
      {sub && (
        <div style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)", marginTop: "0.25rem" }}>
          {sub}
        </div>
      )}
    </div>
  );
}

function SortableHeader({ col, label, sortKey, sortDir, onSort }) {
  const active = sortKey === col;
  return (
    <th onClick={() => onSort(col)} style={{ cursor: "pointer", whiteSpace: "nowrap" }}>
      <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
        {label}
        {active ? (
          sortDir === "asc" ? <ChevronUp size={13} /> : <ChevronDown size={13} />
        ) : (
          <ArrowUpDown size={12} color="var(--color-border-hover)" />
        )}
      </span>
    </th>
  );
}

function f(value) {
  if (value == null) return "—";
  return (value * 100).toLocaleString("id-ID", { maximumFractionDigits: 1 }) + "%";
}

export default function TentangModelPage({ modelInfo }) {
  const [sortKey, setSortKey] = useState("class_name");
  const [sortDir, setSortDir] = useState("asc");

  const ms = modelInfo?.metrics_summary ?? null;
  const perClass = modelInfo?.per_class_metrics ?? null;

  const handleSort = (col) => {
    if (sortKey === col) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(col);
      setSortDir("asc");
    }
  };

  const sortedMetrics = perClass
    ? [...perClass].sort((a, b) => {
        const av = a[sortKey];
        const bv = b[sortKey];
        if (typeof av === "string") {
          return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
        }
        return sortDir === "asc" ? av - bv : bv - av;
      })
    : [];

  return (
    <Layout>
      <div className="container" style={{ padding: "2rem 1rem 3rem" }}>
        {/* Header */}
        <div style={{ marginBottom: "2rem" }}>
          <span className="badge badge-primary" style={{ marginBottom: "0.75rem" }}>
            <BarChart3 size={13} /> Tentang Model
          </span>
          <h1
            style={{
              fontSize: "var(--font-size-2xl)",
              fontWeight: "var(--font-weight-bold)",
              marginBottom: "0.5rem",
            }}
          >
            Tentang Model CNN
          </h1>
          <p style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-muted)", maxWidth: "680px" }}>
            Informasi lengkap tentang arsitektur model, metrik evaluasi, dan keterbatasannya.
            Semua angka diambil dari respons API — bukan nilai yang ditulis di kode.
          </p>
        </div>

        {/* Architecture Summary */}
        <div className="card" style={{ marginBottom: "1.5rem" }}>
          <h2
            style={{
              fontSize: "var(--font-size-lg)",
              fontWeight: "var(--font-weight-semibold)",
              marginBottom: "1rem",
            }}
          >
            Ringkasan Arsitektur
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
              gap: "0.75rem",
              fontSize: "var(--font-size-sm)",
            }}
          >
            {[
              ["Tipe Model", "Custom CNN (Sequential)"],
              ["Input", "128 × 128 RGB"],
              ["Jumlah Kelas", "23"],
              ["Dataset", "Fish4Knowledge"],
              ["Pembagian Data", "70 / 15 / 15 (latih/val/uji)"],
              ["Framework", "TensorFlow 2.20 / Keras 3.13"],
            ].map(([k, v]) => (
              <div
                key={k}
                style={{
                  padding: "0.75rem",
                  background: "var(--color-bg)",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--color-border)",
                }}
              >
                <div style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)", marginBottom: "0.25rem" }}>
                  {k}
                </div>
                <div style={{ fontWeight: "var(--font-weight-semibold)" }}>{v}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Metrics Summary */}
        {ms ? (
          <div style={{ marginBottom: "1.5rem" }}>
            <h2
              style={{
                fontSize: "var(--font-size-lg)",
                fontWeight: "var(--font-weight-semibold)",
                marginBottom: "1rem",
              }}
            >
              Metrik Evaluasi (Set Uji)
            </h2>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
                gap: "1rem",
                marginBottom: "1rem",
              }}
            >
              <MetricCard
                label="Akurasi"
                value={ms.accuracy != null ? (ms.accuracy * 100).toLocaleString("id-ID", { maximumFractionDigits: 2 }) + "%" : null}
                sub={`${ms.test_samples?.toLocaleString("id-ID") ?? "—"} sampel uji`}
              />
              <MetricCard
                label="Macro F1"
                value={ms.macro_f1 != null ? (ms.macro_f1 * 100).toLocaleString("id-ID", { maximumFractionDigits: 2 }) + "%" : null}
                sub="Rata-rata antar kelas"
              />
              <MetricCard
                label="Weighted F1"
                value={ms.weighted_f1 != null ? (ms.weighted_f1 * 100).toLocaleString("id-ID", { maximumFractionDigits: 2 }) + "%" : null}
                sub="Berbobot support"
              />
            </div>

            {/* Why macro F1 matters */}
            <div className="alert alert-info">
              <Info size={15} style={{ flexShrink: 0 }} />
              <span style={{ fontSize: "var(--font-size-xs)" }}>
                <strong>Mengapa Macro F1 penting?</strong> Akurasi tinggi tidak berarti semua
                kelas sama baiknya. Data tidak seimbang — beberapa kelas memiliki ribuan sampel
                sementara yang lain hanya 3–8. Macro F1 menghitung rata-rata F1 tiap kelas tanpa
                pembobotan, sehingga mencerminkan performa pada kelas minoritas dengan lebih jujur.
              </span>
            </div>
          </div>
        ) : (
          <div className="alert alert-warning" style={{ marginBottom: "1.5rem" }}>
            <AlertTriangle size={15} style={{ flexShrink: 0 }} />
            <span>Metrik evaluasi tidak tersedia saat ini.</span>
          </div>
        )}

        {/* Per-class metrics table */}
        {sortedMetrics.length > 0 && (
          <div style={{ marginBottom: "1.5rem" }}>
            <h2
              style={{
                fontSize: "var(--font-size-lg)",
                fontWeight: "var(--font-weight-semibold)",
                marginBottom: "0.5rem",
              }}
            >
              Metrik Per Kelas
            </h2>
            <p style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)", marginBottom: "1rem" }}>
              Klik judul kolom untuk mengurutkan. Kelas dengan support ≤ {SMALL_SUPPORT_THRESHOLD} sampel uji diberi penanda peringatan.
            </p>

            <div className="card" style={{ padding: 0, overflow: "hidden" }}>
              <div style={{ overflowX: "auto" }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <SortableHeader col="class_name" label="Kelas" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                      <SortableHeader col="precision" label="Precision" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                      <SortableHeader col="recall" label="Recall" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                      <SortableHeader col="f1" label="F1-Score" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                      <SortableHeader col="support" label="Support (Uji)" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                      <th>Status</th>
                      <th>Visual F1</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedMetrics.map((item) => {
                      const isSmall = item.support <= SMALL_SUPPORT_THRESHOLD;
                      const f1Val = item.f1 ?? 0;
                      return (
                        <tr key={item.class_name}>
                          <td>
                            <code>{item.class_name}</code>
                          </td>
                          <td>{f(item.precision)}</td>
                          <td>{f(item.recall)}</td>
                          <td style={{ fontWeight: "var(--font-weight-semibold)" }}>
                            {f(item.f1)}
                          </td>
                          <td>{item.support?.toLocaleString("id-ID") ?? "—"}</td>
                          <td>
                            {isSmall ? (
                              <span className="badge badge-warning">
                                <AlertTriangle size={10} />
                                Sedikit
                              </span>
                            ) : f1Val === 1 ? (
                              <span className="badge badge-success">Sempurna</span>
                            ) : f1Val >= 0.9 ? (
                              <span className="badge badge-success">Sangat Baik</span>
                            ) : f1Val >= 0.7 ? (
                              <span className="badge badge-primary">Baik</span>
                            ) : (
                              <span className="badge badge-danger">Rendah</span>
                            )}
                          </td>
                          <td style={{ minWidth: "100px" }}>
                            <div className="prob-bar-track" style={{ height: "7px" }}>
                              <div
                                className="prob-bar-fill"
                                style={{
                                  "--bar-width": `${f1Val * 100}%`,
                                  width: `${f1Val * 100}%`,
                                  backgroundColor: isSmall
                                    ? "var(--color-warning)"
                                    : f1Val >= 0.9
                                    ? "var(--color-success)"
                                    : "var(--color-primary)",
                                }}
                              />
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Limitations */}
        <div className="card">
          <h2
            style={{
              fontSize: "var(--font-size-lg)",
              fontWeight: "var(--font-weight-semibold)",
              marginBottom: "1rem",
            }}
          >
            Batasan dan Penggunaan yang Sesuai
          </h2>
          <ul
            style={{
              listStyle: "none",
              display: "flex",
              flexDirection: "column",
              gap: "0.75rem",
            }}
          >
            {[
              `Label fish_01–fish_23 adalah label kelas dari struktur folder dataset, bukan nama spesies yang sudah diverifikasi.`,
              `Tingkat keyakinan adalah keluaran softmax model; angka tinggi tidak menjamin prediksi benar.`,
              `Model dilatih pada gambar Fish4Knowledge. Foto dengan pencahayaan, sudut, atau latar yang berbeda dapat menghasilkan prediksi keliru.`,
              `Aplikasi ini bukan alat identifikasi lapangan atau diagnosis biologis.`,
            ].map((text, i) => (
              <li
                key={i}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "0.625rem",
                  fontSize: "var(--font-size-sm)",
                  color: "var(--color-text-muted)",
                }}
              >
                <Info size={15} color="var(--color-info)" style={{ flexShrink: 0, marginTop: "1px" }} />
                <span>{text}</span>
              </li>
            ))}
          </ul>

          <div style={{ marginTop: "1.25rem", paddingTop: "1rem", borderTop: "1px solid var(--color-border)" }}>
            <div style={{ fontSize: "var(--font-size-xs)", fontWeight: "var(--font-weight-semibold)", color: "var(--color-text-muted)", marginBottom: "0.5rem" }}>
              Privasi Data
            </div>
            <p style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-muted)" }}>
              Gambar yang diunggah diproses sementara di memori server dan tidak disimpan secara
              permanen. Riwayat prediksi (label dan keyakinan) disimpan di database terikat pada
              ID unik browser — tidak ada data gambar yang persisten.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}

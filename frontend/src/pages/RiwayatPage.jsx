import React, { useState, useEffect, useCallback } from "react";
import {
  Clock,
  Trash2,
  Trash,
  Info,
  AlertCircle,
  ChevronDown,
  Plus,
  Eye,
} from "lucide-react";
import Layout from "../components/layout/Layout.jsx";
import {
  listPredictions,
  getPrediction,
  deletePrediction,
  deleteAllPredictions,
} from "../services/api.js";

function formatDate(isoString) {
  if (!isoString) return "—";
  try {
    return new Date(isoString).toLocaleString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return isoString;
  }
}

function ConfidenceBadge({ value }) {
  const pct = (value * 100).toLocaleString("id-ID", { maximumFractionDigits: 1 }) + "%";
  if (value >= 0.9) return <span className="badge badge-success">{pct}</span>;
  if (value >= 0.6) return <span className="badge badge-primary">{pct}</span>;
  return <span className="badge badge-warning">{pct}</span>;
}

function DetailModal({ prediction, onClose }) {
  if (!prediction) return null;
  const { predicted_class, confidence, top5, created_at, inference_ms } = prediction;
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Detail prediksi"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 500,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
        backgroundColor: "rgba(0,0,0,0.5)",
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="card"
        style={{
          maxWidth: "480px",
          width: "100%",
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "1rem",
          }}
        >
          <h2 style={{ fontSize: "var(--font-size-lg)", fontWeight: "var(--font-weight-semibold)" }}>
            Detail Prediksi
          </h2>
          <button type="button" className="btn btn-ghost btn-sm" onClick={onClose}>
            Tutup
          </button>
        </div>

        <div style={{ marginBottom: "0.75rem" }}>
          <div style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)", marginBottom: "0.25rem" }}>
            Kelas
          </div>
          <code style={{ fontSize: "1.25rem", fontWeight: "bold" }}>{predicted_class}</code>
        </div>
        <div style={{ marginBottom: "0.75rem" }}>
          <div style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)", marginBottom: "0.25rem" }}>
            Tingkat keyakinan model
          </div>
          <ConfidenceBadge value={confidence} />
        </div>
        {inference_ms != null && (
          <div style={{ marginBottom: "1rem" }}>
            <div style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)", marginBottom: "0.25rem" }}>
              Waktu inferensi
            </div>
            <span style={{ fontSize: "var(--font-size-sm)" }}>{inference_ms.toFixed(0)} ms</span>
          </div>
        )}

        {top5?.length > 0 && (
          <div>
            <div style={{ fontSize: "var(--font-size-xs)", fontWeight: "var(--font-weight-semibold)", marginBottom: "0.5rem", color: "var(--color-text-muted)" }}>
              Top 5 Probabilitas
            </div>
            {top5.map((item, i) => {
              const pct = item.confidence * 100;
              return (
                <div key={item.class_name} style={{ marginBottom: "6px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "var(--font-size-xs)", marginBottom: "2px" }}>
                    <code>{i + 1}. {item.class_name}</code>
                    <span>{pct < 0.05 ? "<0,1%" : pct.toLocaleString("id-ID", { maximumFractionDigits: 1 }) + "%"}</span>
                  </div>
                  <div className="prob-bar-track" style={{ height: "6px" }}>
                    <div
                      className="prob-bar-fill"
                      style={{ "--bar-width": `${pct}%`, width: `${pct}%`, backgroundColor: i === 0 ? "var(--color-primary)" : "#94A3B8" }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div style={{ marginTop: "1rem", fontSize: "var(--font-size-xs)", color: "var(--color-text-subtle)" }}>
          {formatDate(created_at)}
        </div>
      </div>
    </div>
  );
}

export default function RiwayatPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [skip, setSkip] = useState(0);
  const [deleting, setDeleting] = useState(null);
  const [confirmDeleteAll, setConfirmDeleteAll] = useState(false);
  const [detailItem, setDetailItem] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const LIMIT = 10;

  const fetchItems = useCallback(async (currentSkip = 0, append = false) => {
    if (currentSkip === 0) setLoading(true);
    else setLoadingMore(true);
    setError(null);
    try {
      const res = await listPredictions();
      const data = res?.data ?? res?.items ?? (Array.isArray(res) ? res : []);
      setHasMore(data.length === LIMIT);
      if (append) {
        setItems((prev) => [...prev, ...data]);
      } else {
        setItems(data);
      }
      setSkip(currentSkip + data.length);
    } catch (e) {
      setError(e?.message ?? "Gagal memuat riwayat.");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    fetchItems(0, false);
  }, [fetchItems]);

  const handleDelete = async (id) => {
    setDeleting(id);
    try {
      await deletePrediction(id);
      setItems((prev) => prev.filter((item) => item.id !== id));
    } catch (e) {
      alert(e?.message ?? "Gagal menghapus.");
    } finally {
      setDeleting(null);
    }
  };

  const handleDeleteAll = async () => {
    setConfirmDeleteAll(false);
    setLoading(true);
    try {
      await deleteAllPredictions();
      setItems([]);
    } catch (e) {
      setError(e?.message ?? "Gagal menghapus semua riwayat.");
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = async (id) => {
    setDetailLoading(true);
    try {
      const res = await getPrediction(id);
      setDetailItem(res?.data ?? res);
    } catch (e) {
      alert(e?.message ?? "Gagal memuat detail.");
    } finally {
      setDetailLoading(false);
    }
  };

  const SkeletonRow = () => (
    <tr>
      {[1, 2, 3, 4, 5].map((i) => (
        <td key={i}><div className="skeleton" style={{ height: "16px" }} /></td>
      ))}
    </tr>
  );

  return (
    <Layout>
      {detailItem && (
        <DetailModal prediction={detailItem} onClose={() => setDetailItem(null)} />
      )}

      {/* Delete-all confirmation dialog */}
      {confirmDeleteAll && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Konfirmasi hapus semua riwayat"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 500,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
            backgroundColor: "rgba(0,0,0,0.5)",
          }}
        >
          <div className="card" style={{ maxWidth: "400px", width: "100%" }}>
            <h2 style={{ fontSize: "var(--font-size-lg)", fontWeight: "var(--font-weight-semibold)", marginBottom: "0.75rem" }}>
              Hapus semua riwayat?
            </h2>
            <p style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-muted)", marginBottom: "1.25rem" }}>
              Tindakan ini akan menghapus seluruh riwayat prediksi yang terikat pada browser ini secara permanen dan tidak dapat dibatalkan.
            </p>
            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button type="button" className="btn btn-danger" onClick={handleDeleteAll}>
                Ya, Hapus Semua
              </button>
              <button type="button" className="btn btn-ghost" onClick={() => setConfirmDeleteAll(false)}>
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="container" style={{ padding: "2rem 1rem 3rem" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "0.75rem",
            marginBottom: "1.75rem",
          }}
        >
          <div>
            <h1 style={{ fontSize: "var(--font-size-2xl)", fontWeight: "var(--font-weight-bold)", marginBottom: "0.25rem" }}>
              Riwayat Prediksi
            </h1>
            <p style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-muted)" }}>
              Riwayat terikat pada browser ini (berdasarkan ID lokal — bukan akun).
            </p>
          </div>
          {items.length > 0 && (
            <button
              type="button"
              className="btn btn-danger btn-sm"
              onClick={() => setConfirmDeleteAll(true)}
            >
              <Trash size={14} />
              Hapus Semua Riwayat Saya
            </button>
          )}
        </div>

        {/* Client-id privacy note */}
        <div className="alert alert-info" style={{ marginBottom: "1.25rem" }}>
          <Info size={16} style={{ flexShrink: 0 }} />
          <span style={{ fontSize: "var(--font-size-xs)" }}>
            Riwayat prediksi disimpan di server dan diidentifikasi oleh ID unik browser ini.
            Tidak ada gambar yang tersimpan — hanya label kelas dan tingkat keyakinan model.
            Membuka browser berbeda tidak akan menampilkan riwayat ini.
          </span>
        </div>

        {/* Error */}
        {error && (
          <div className="alert alert-danger" role="alert" style={{ marginBottom: "1rem" }}>
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{error}</span>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => fetchItems(0, false)}>
              Coba Lagi
            </button>
          </div>
        )}

        {/* Table card */}
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Waktu</th>
                  <th>Kelas Prediksi</th>
                  <th>Keyakinan</th>
                  <th>Umpan Balik</th>
                  <th style={{ textAlign: "center" }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {loading
                  ? Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
                  : items.length === 0
                  ? (
                    <tr>
                      <td
                        colSpan={5}
                        style={{
                          textAlign: "center",
                          padding: "3rem 1rem",
                          color: "var(--color-text-muted)",
                        }}
                      >
                        <div style={{ marginBottom: "0.75rem" }}>
                          <Clock size={36} strokeWidth={1} color="var(--color-border-hover)" />
                        </div>
                        <p style={{ fontWeight: "var(--font-weight-medium)", marginBottom: "0.5rem" }}>
                          Belum ada riwayat prediksi
                        </p>
                        <p style={{ fontSize: "var(--font-size-sm)" }}>
                          Coba lakukan klasifikasi terlebih dahulu.
                        </p>
                      </td>
                    </tr>
                  )
                  : items.map((item) => (
                    <tr key={item.id}>
                      <td style={{ fontSize: "var(--font-size-xs)", whiteSpace: "nowrap" }}>
                        {formatDate(item.created_at)}
                      </td>
                      <td>
                        <code>{item.predicted_class}</code>
                      </td>
                      <td>
                        <ConfidenceBadge value={item.confidence} />
                      </td>
                      <td>
                        {item.feedback_is_correct === true ? (
                          <span className="badge badge-success">Benar</span>
                        ) : item.feedback_is_correct === false ? (
                          <span className="badge badge-warning">Salah</span>
                        ) : (
                          <span className="badge badge-neutral">—</span>
                        )}
                      </td>
                      <td style={{ textAlign: "center" }}>
                        <div style={{ display: "flex", gap: "0.5rem", justifyContent: "center" }}>
                          <button
                            type="button"
                            className="btn btn-ghost btn-sm"
                            onClick={() => handleViewDetail(item.id)}
                            disabled={detailLoading}
                            aria-label={`Lihat detail prediksi ${item.predicted_class}`}
                          >
                            <Eye size={13} />
                          </button>
                          <button
                            type="button"
                            className="btn btn-ghost btn-sm"
                            onClick={() => handleDelete(item.id)}
                            disabled={deleting === item.id}
                            aria-label={`Hapus prediksi ${item.predicted_class}`}
                            style={{ color: "var(--color-danger)" }}
                          >
                            {deleting === item.id ? (
                              <span className="spinner" style={{ width: "12px", height: "12px" }} />
                            ) : (
                              <Trash2 size={13} />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          {/* Load more */}
          {hasMore && (
            <div style={{ padding: "1rem", textAlign: "center", borderTop: "1px solid var(--color-border)" }}>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => fetchItems(skip, true)}
                disabled={loadingMore}
              >
                {loadingMore ? (
                  <><span className="spinner" style={{ width: "13px", height: "13px" }} /> Memuat…</>
                ) : (
                  <><ChevronDown size={15} /> Muat Lebih Banyak</>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

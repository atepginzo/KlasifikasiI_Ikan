import { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AlertTriangle } from "lucide-react";
import { useBackendStatus } from "./hooks/useBackendStatus.js";
import "./styles/index.css";

// Lazy-loaded pages for code splitting
const HomePage = lazy(() => import("./pages/HomePage.jsx"));
const KlasifikasiPage = lazy(() => import("./pages/KlasifikasiPage.jsx"));
const RiwayatPage = lazy(() => import("./pages/RiwayatPage.jsx"));
const TentangModelPage = lazy(() => import("./pages/TentangModelPage.jsx"));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage.jsx"));

function PageLoader() {
  return (
    <div
      style={{
        minHeight: "60vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <span className="spinner spinner-lg" aria-label="Memuat halaman…" />
    </div>
  );
}

export default function App() {
  const { status: backendStatus, modelInfo, retry } = useBackendStatus();

  return (
    <BrowserRouter>
      {/* Global backend error banner (non-blocking, dismissible) */}
      {backendStatus === "error" && (
        <div
          role="alert"
          style={{
            backgroundColor: "#fef2f2",
            borderBottom: "1px solid var(--color-danger-border)",
            padding: "0.5rem 1rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.75rem",
            fontSize: "var(--font-size-sm)",
            color: "#991b1b",
            zIndex: 200,
            position: "relative",
          }}
        >
          <AlertTriangle size={16} style={{ flexShrink: 0 }} />
          <span>Server tidak dapat dihubungi. Beberapa fitur mungkin tidak tersedia.</span>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={retry}
            style={{ color: "#991b1b", borderColor: "var(--color-danger-border)" }}
          >
            Coba Lagi
          </button>
        </div>
      )}

      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route
            path="/klasifikasi"
            element={
              <KlasifikasiPage
                backendStatus={backendStatus}
                modelInfo={modelInfo}
              />
            }
          />
          <Route path="/riwayat" element={<RiwayatPage />} />
          <Route
            path="/tentang-model"
            element={<TentangModelPage modelInfo={modelInfo} />}
          />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

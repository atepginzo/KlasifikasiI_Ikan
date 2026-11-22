import { Link } from "react-router-dom";
import { Fish, ArrowLeft } from "lucide-react";
import Layout from "../components/layout/Layout.jsx";

export default function NotFoundPage() {
  return (
    <Layout>
      <div
        className="container"
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "60vh",
          textAlign: "center",
          padding: "3rem 1rem",
        }}
      >
        <div
          style={{
            width: "80px",
            height: "80px",
            borderRadius: "var(--radius-full)",
            backgroundColor: "var(--color-primary-light)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--color-primary)",
            marginBottom: "1.5rem",
          }}
        >
          <Fish size={36} strokeWidth={1.5} />
        </div>

        <div
          style={{
            fontSize: "4rem",
            fontWeight: "var(--font-weight-bold)",
            color: "var(--color-primary-light)",
            lineHeight: 1,
            marginBottom: "0.5rem",
          }}
        >
          404
        </div>
        <h1
          style={{
            fontSize: "var(--font-size-2xl)",
            fontWeight: "var(--font-weight-bold)",
            marginBottom: "0.75rem",
          }}
        >
          Halaman tidak ditemukan
        </h1>
        <p
          style={{
            fontSize: "var(--font-size-base)",
            color: "var(--color-text-muted)",
            maxWidth: "400px",
            marginBottom: "2rem",
          }}
        >
          Halaman yang Anda cari tidak ada atau telah dipindahkan.
        </p>
        <Link to="/" className="btn btn-primary">
          <ArrowLeft size={16} />
          Kembali ke Beranda
        </Link>
      </div>
    </Layout>
  );
}

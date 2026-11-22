import React from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Fish, Menu, X } from "lucide-react";
import { useState } from "react";

const NAV_ITEMS = [
  { to: "/", label: "Beranda" },
  { to: "/klasifikasi", label: "Klasifikasi" },
  { to: "/riwayat", label: "Riwayat" },
  { to: "/tentang-model", label: "Tentang Model" },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header
      style={{
        backgroundColor: "var(--color-surface)",
        borderBottom: "1px solid var(--color-border)",
        position: "sticky",
        top: 0,
        zIndex: 100,
        boxShadow: "var(--shadow-sm)",
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
        {/* Brand */}
        <Link
          to="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            textDecoration: "none",
            color: "inherit",
          }}
        >
          <div
            style={{
              width: "38px",
              height: "38px",
              borderRadius: "var(--radius-md)",
              background:
                "linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              flexShrink: 0,
            }}
          >
            <Fish size={22} />
          </div>
          <div>
            <div
              style={{
                fontWeight: "var(--font-weight-bold)",
                fontSize: "1.05rem",
                color: "var(--color-text-main)",
                lineHeight: 1.2,
              }}
            >
              AI Fish Classifier
            </div>
            <div
              style={{
                fontSize: "var(--font-size-xs)",
                color: "var(--color-text-muted)",
                lineHeight: 1,
              }}
            >
              Klasifikasi Citra Ikan
            </div>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav
          style={{ display: "flex", gap: "4px", alignItems: "center" }}
          aria-label="Navigasi utama"
          className="desktop-nav"
        >
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              style={({ isActive }) => ({
                padding: "0.4rem 0.875rem",
                borderRadius: "var(--radius-md)",
                fontWeight: isActive
                  ? "var(--font-weight-semibold)"
                  : "var(--font-weight-normal)",
                color: isActive
                  ? "var(--color-primary)"
                  : "var(--color-text-muted)",
                textDecoration: "none",
                fontSize: "var(--font-size-sm)",
                transition: "all var(--transition-fast)",
                backgroundColor: isActive ? "var(--color-primary-light)" : "transparent",
              })}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Mobile Hamburger */}
        <button
          type="button"
          className="btn btn-ghost btn-sm mobile-menu-btn"
          onClick={() => setMenuOpen((v) => !v)}
          aria-expanded={menuOpen}
          aria-label="Menu navigasi"
          style={{ padding: "0.4rem" }}
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Dropdown Menu */}
      {menuOpen && (
        <nav
          style={{
            backgroundColor: "var(--color-surface)",
            borderTop: "1px solid var(--color-border)",
            padding: "0.5rem 1rem 1rem",
          }}
          aria-label="Navigasi mobile"
        >
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              onClick={() => setMenuOpen(false)}
              style={({ isActive }) => ({
                display: "block",
                padding: "0.75rem 0.875rem",
                borderRadius: "var(--radius-md)",
                fontWeight: isActive
                  ? "var(--font-weight-semibold)"
                  : "var(--font-weight-normal)",
                color: isActive ? "var(--color-primary)" : "var(--color-text-main)",
                textDecoration: "none",
                marginBottom: "2px",
                backgroundColor: isActive ? "var(--color-primary-light)" : "transparent",
              })}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      )}

      <style>{`
        .desktop-nav { display: flex; }
        .mobile-menu-btn { display: none; }
        @media (max-width: 767px) {
          .desktop-nav { display: none; }
          .mobile-menu-btn { display: inline-flex; }
        }
      `}</style>
    </header>
  );
}

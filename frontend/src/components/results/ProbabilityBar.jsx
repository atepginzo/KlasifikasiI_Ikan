/**
 * Animated horizontal probability bar.
 * Uses CSS animation for the fill transition.
 * @param {object} props
 * @param {string} props.label
 * @param {number} props.value - 0…1
 * @param {boolean} props.isTop - Highlights the top result
 * @param {number} props.rank - 1-based rank index
 */
export default function ProbabilityBar({ label, value, isTop, rank }) {
  const pct = value * 100;
  const displayPct =
    pct < 0.05 ? "<0,1%" : pct.toLocaleString("id-ID", { maximumFractionDigits: 1 }) + "%";

  const barWidth = `${Math.max(pct, pct < 0.05 ? 0.3 : 0)}%`;

  return (
    <div
      data-testid="probability-bar-row"
      data-rank={rank}
      data-class={label}
      style={{
        padding: isTop ? "0.75rem" : "0.5rem 0",
        borderRadius: isTop ? "var(--radius-md)" : 0,
        backgroundColor: isTop ? "var(--color-primary-light)" : "transparent",
        border: isTop ? "1px solid #BAE6FD" : "none",
      }}
    >
      {/* Label row */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          marginBottom: "0.375rem",
        }}
      >
        <span
          data-testid="probability-label"
          style={{
            fontSize: "var(--font-size-sm)",
            fontFamily: "var(--font-family-mono)",
            fontWeight: isTop ? "var(--font-weight-bold)" : "var(--font-weight-normal)",
            color: isTop ? "var(--color-primary-hover)" : "var(--color-text-main)",
          }}
        >
          {rank}. {label}
        </span>
        <span
          data-testid="probability-value"
          style={{
            fontSize: "var(--font-size-sm)",
            fontWeight: isTop ? "var(--font-weight-bold)" : "var(--font-weight-normal)",
            color: isTop ? "var(--color-primary-hover)" : "var(--color-text-muted)",
            minWidth: "50px",
            textAlign: "right",
          }}
        >
          {displayPct}
        </span>
      </div>

      {/* Bar track */}
      <div className="prob-bar-track">
        <div
          className="prob-bar-fill"
          style={{
            "--bar-width": barWidth,
            width: barWidth,
            backgroundColor: isTop ? "var(--color-primary)" : "#94A3B8",
          }}
          role="progressbar"
          aria-valuenow={pct.toFixed(2)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${label}: ${displayPct}`}
        />
      </div>
    </div>
  );
}

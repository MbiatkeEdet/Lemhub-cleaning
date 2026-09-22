/**
 * The headline number form: one value, its label, and — when there's a
 * meaningful comparison — a signed delta. A delta is only shown when the
 * caller supplies one, because an invented baseline is worse than none.
 */
export default function MetricTile({
  label,
  value,
  delta = null,
  deltaLabel = "vs last month",
  hint,
  tone = "default",
  icon = null,
}) {
  const positive = delta !== null && delta > 0;
  const negative = delta !== null && delta < 0;

  return (
    <div
      className={"relative overflow-hidden rounded-2xl border p-5 transition-all duration-300 hover:-translate-y-0.5 " +
        (tone === "urgent"
          ? "border-clay/30 bg-clay/[0.03]"
          : tone === "muted"
          ? "border-mist bg-linen/50"
          : "border-mist bg-white/70")
      }
    >
      {tone === "urgent" && (
        <span className="absolute inset-x-0 top-0 h-px bg-clay" aria-hidden="true" />
      )}

      <div className="mb-1 flex items-center gap-2">
        {icon}
        <p className="text-xs text-ink/45">{label}</p>
      </div>

      <p className="font-display text-2xl leading-tight text-ink">{value}</p>

      {delta !== null && (
        <p className="mt-1.5 flex items-center gap-1.5 text-xs">
          <span
            className={positive ? "text-[#1F6B4E]" : negative ? "text-[#A6342A]" : "text-ink/45"}
          >
            {positive ? "▲" : negative ? "▼" : "—"} {Math.abs(delta).toFixed(1)}%
          </span>
          <span className="text-ink/40">{deltaLabel}</span>
        </p>
      )}

      {hint && <p className="mt-1.5 text-xs leading-snug text-ink/45">{hint}</p>}
    </div>
  );
}

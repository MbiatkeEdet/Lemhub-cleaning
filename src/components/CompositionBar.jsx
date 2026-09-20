import { useState } from "react";

/**
 * A single stacked bar showing how a whole divides into parts, with a
 * legend beneath. Segments carry a 2px surface gap so adjacent fills never
 * blend into one another, and the legend names every part — color is never
 * the only cue.
 *
 * `segments`: [{ key, label, value, color }]
 */
export default function CompositionBar({ title, caption, segments = [], formatValue = (v) => v.toLocaleString() }) {
  const [active, setActive] = useState(null);
  const total = segments.reduce((sum, s) => sum + s.value, 0);
  const present = segments.filter((s) => s.value > 0);

  return (
    <section className="rounded-2xl border border-mist bg-white/70 p-5">
      <header className="mb-4 flex items-baseline justify-between gap-4">
        <div>
          <h3 className="font-display text-lg text-ink">{title}</h3>
          {caption && <p className="mt-0.5 text-xs text-ink/45">{caption}</p>}
        </div>
        <p className="shrink-0 font-display text-2xl text-ink">{formatValue(total)}</p>
      </header>

      {total === 0 ? (
        <p className="py-6 text-center text-sm text-ink/40">No bookings recorded yet.</p>
      ) : (
        <>
          <div className="flex h-3 w-full gap-0.5 overflow-hidden rounded-full" role="img" aria-label={`${title}: ${present.map((s) => `${s.label} ${s.value}`).join(", ")}`}>
            {present.map((s) => (
              <div
                key={s.key}
                onMouseEnter={() => setActive(s.key)}
                onMouseLeave={() => setActive(null)}
                title={`${s.label}: ${formatValue(s.value)}`}
                className="h-full rounded-sm transition-opacity duration-200 first:rounded-l-md last:rounded-r-md"
                style={{
                  width: `${(s.value / total) * 100}%`,
                  backgroundColor: s.color,
                  opacity: active === null || active === s.key ? 1 : 0.4,
                }}
              />
            ))}
          </div>

          <ul className="mt-4 grid gap-2 sm:grid-cols-2">
            {segments.map((s) => (
              <li
                key={s.key}
                onMouseEnter={() => setActive(s.key)}
                onMouseLeave={() => setActive(null)}
                className="flex items-center justify-between gap-3 rounded-lg px-1 py-0.5 transition-colors hover:bg-linen/50"
              >
                <span className="flex min-w-0 items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: s.color }}
                    aria-hidden="true"
                  />
                  <span className="truncate text-sm text-ink/70">{s.label}</span>
                </span>
                <span className="shrink-0 font-mono text-xs text-ink">
                  {formatValue(s.value)}
                  <span className="ml-1.5 text-ink/40">
                    {total > 0 ? `${Math.round((s.value / total) * 100)}%` : ""}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}

import { rampColor } from "../lib/chartTheme";

/**
 * Density across an ordered set of buckets (days, slots). Magnitude is a
 * single hue light→dark; the count sits inside each cell, so the color is
 * reinforcement rather than the only encoding.
 *
 * `cells`: [{ key, label, value, sublabel? }]
 */
export default function HeatStrip({ title, caption, cells = [], legendLabel = "bookings" }) {
  const max = Math.max(...cells.map((c) => c.value), 1);

  return (
    <section className="rounded-2xl border border-mist bg-white/70 p-5">
      <header className="mb-4 flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <h3 className="font-display text-lg text-ink">{title}</h3>
          {caption && <p className="mt-0.5 text-xs text-ink/45">{caption}</p>}
        </div>
        <div className="flex items-center gap-2 text-xs text-ink/40">
          <span>0</span>
          <span className="flex h-2.5 overflow-hidden rounded-full">
            {[0.1, 0.3, 0.5, 0.7, 0.9].map((f) => (
              <span key={f} className="w-4" style={{ backgroundColor: rampColor(f) }} />
            ))}
          </span>
          <span>
            {max} {legendLabel}
          </span>
        </div>
      </header>

      <div className="grid grid-cols-7 gap-1.5">
        {cells.map((cell) => {
          const fraction = cell.value / max;
          const dark = fraction > 0.55;

          return (
            <div
              key={cell.key}
              title={`${cell.label}: ${cell.value} ${legendLabel}`}
              className="flex aspect-square flex-col items-center justify-center rounded-xl border border-mist/60 p-1 text-center"
              style={{ backgroundColor: rampColor(fraction) }}
            >
              <span
                className={"font-display text-base leading-none " + (dark ? "text-linen" : "text-ink")}
              >
                {cell.value}
              </span>
              <span
                className={"mt-1 text-[10px] leading-tight " +
                  (dark ? "text-linen/70" : "text-ink/45")
                }
              >
                {cell.label}
              </span>
            </div>
          );
        })}
      </div>

      {cells.some((c) => c.sublabel) && (
        <p className="mt-3 border-t border-mist pt-3 text-xs text-ink/45">
          Numbers are bookings scheduled for that day.
        </p>
      )}
    </section>
  );
}

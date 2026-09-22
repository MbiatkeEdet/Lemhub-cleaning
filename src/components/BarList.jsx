import { useState } from "react";
import { ACCENT, seriesColor } from "../lib/chartTheme";

/**
 * A ranked horizontal bar list — the right form when the job is comparing
 * magnitude across a handful of named categories. Every bar is directly
 * labelled, so identity never depends on color alone.
 *
 * `items`: [{ label, value, color?, sublabel? }]
 */
export default function BarList({
  title,
  caption,
  items = [],
  formatValue = (v) => v.toLocaleString(),
  emptyMessage = "Nothing to show yet.",
  colorful = false,
  max: maxOverride,
}) {
  const [hovered, setHovered] = useState(null);
  const max = maxOverride ?? Math.max(...items.map((i) => i.value), 1);

  return (
    <section className="rounded-2xl border border-mist bg-white/70 p-5">
      <header className="mb-4">
        <h3 className="font-display text-lg text-ink">{title}</h3>
        {caption && <p className="mt-0.5 text-xs text-ink/45">{caption}</p>}
      </header>

      {items.length === 0 ? (
        <p className="py-6 text-center text-sm text-ink/40">{emptyMessage}</p>
      ) : (
        <ul className="grid gap-2.5">
          {items.map((item, i) => {
            const pct = (item.value / max) * 100;
            const color = item.color || (colorful ? seriesColor(i) : ACCENT);

            return (
              <li
                key={item.label}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
                className="group relative"
              >
                <div className="mb-1 flex items-baseline justify-between gap-3">
                  <span className="truncate text-sm text-ink/75">{item.label}</span>
                  <span className="shrink-0 font-mono text-xs text-ink">{formatValue(item.value)}</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-linen">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.max(pct, item.value > 0 ? 2 : 0)}%`,
                      backgroundColor: color,
                      opacity: hovered === null || hovered === i ? 1 : 0.45,
                    }}
                  />
                </div>
                {item.sublabel && (
                  <p className="mt-1 text-xs text-ink/40">
                    {item.sublabel}
                  </p>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

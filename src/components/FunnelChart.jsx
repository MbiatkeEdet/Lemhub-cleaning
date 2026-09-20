import { SEQUENTIAL } from "../lib/chartTheme";

/**
 * Conversion through ordered stages. Each stage is a bar scaled against the
 * first, with the drop-off from the previous stage called out directly —
 * the number people actually want is the step-to-step loss, not the widths.
 *
 * `stages`: [{ key, label, count }]
 */
export default function FunnelChart({ title, caption, stages = [] }) {
  const top = stages[0]?.count || 0;

  return (
    <section className="rounded-2xl border border-mist bg-white/70 p-5">
      <header className="mb-5">
        <h3 className="font-display text-lg text-ink">{title}</h3>
        {caption && <p className="mt-0.5 text-xs text-ink/45">{caption}</p>}
      </header>

      {top === 0 ? (
        <p className="py-6 text-center text-sm text-ink/40">No bookings have come through yet.</p>
      ) : (
        <ol className="grid gap-3">
          {stages.map((stage, i) => {
            const share = top > 0 ? (stage.count / top) * 100 : 0;
            const previous = i > 0 ? stages[i - 1].count : null;
            const dropOff = previous !== null && previous > 0 ? previous - stage.count : null;
            const color = SEQUENTIAL[Math.min(SEQUENTIAL.length - 1, 2 + i)];

            return (
              <li key={stage.key}>
                <div className="mb-1 flex items-baseline justify-between gap-3">
                  <span className="text-sm text-ink/75">{stage.label}</span>
                  <span className="shrink-0 font-mono text-xs text-ink">
                    {stage.count.toLocaleString()}
                    <span className="ml-1.5 text-ink/40">{Math.round(share)}%</span>
                  </span>
                </div>
                <div className="h-7 w-full overflow-hidden rounded-lg bg-linen">
                  <div
                    className="flex h-full items-center rounded-lg transition-all duration-500"
                    style={{ width: `${Math.max(share, stage.count > 0 ? 3 : 0)}%`, backgroundColor: color }}
                  />
                </div>
                {dropOff !== null && dropOff > 0 && (
                  <p className="mt-1 text-xs text-clay/70">
                    ↓ {dropOff.toLocaleString()} lost at this step
                  </p>
                )}
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}

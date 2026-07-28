import SealBadge from "./SealBadge";

export default function CleanerCard({ cleaner, onRemove }) {
  return (
    <div className="group relative rounded-2xl border border-mist bg-white/60 p-6 transition-shadow hover:shadow-[0_8px_30px_-12px_rgba(31,59,52,0.25)]">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-pine/10 font-display text-lg text-pine">
            {cleaner.initials}
          </div>
          <div>
            <h3 className="font-display text-lg text-ink">{cleaner.name}</h3>
            <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-ink/45">
              {cleaner.years} yrs experience · {cleaner.areas?.[0]}
            </p>
          </div>
        </div>
        <SealBadge size={44} />
      </div>

      <p className="mt-4 text-sm leading-relaxed text-ink/70">{cleaner.bio}</p>

      <div className="mt-4 flex flex-wrap gap-2">
        {cleaner.specialties?.map((s) => (
          <span
            key={s}
            className="rounded-full border border-sage-dim bg-sage/10 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.08em] text-pine"
          >
            {s}
          </span>
        ))}
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-mist pt-4">
        <div className="flex items-center gap-1.5">
          <span className="font-display text-base text-ink">
            {cleaner.rating?.toFixed(1)}
          </span>
          <span className="text-brass">★</span>
          <span className="font-mono text-[11px] text-ink/45">
            ({cleaner.reviews} reviews)
          </span>
        </div>
        {onRemove && (
          <button
            onClick={() => onRemove(cleaner.id)}
            className="font-mono text-[11px] uppercase tracking-[0.1em] text-clay/70 hover:text-clay"
          >
            Remove
          </button>
        )}
      </div>
    </div>
  );
}

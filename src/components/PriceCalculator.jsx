import { APARTMENT_TYPES, FREQUENCIES, calculatePrice, currency } from "../data/pricing";

export default function PriceCalculator({ apartmentId, frequencyId, onChangeApartment, onChangeFrequency }) {
  const result = calculatePrice(apartmentId, frequencyId);

  return (
    <div className="grid gap-8">
      <div>
        <p className="font-mono text-xs uppercase tracking-[0.14em] text-ink/50 mb-3">
          01 · Apartment size
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {APARTMENT_TYPES.map((apt) => {
            const active = apt.id === apartmentId;
            return (
              <button
                type="button"
                key={apt.id}
                onClick={() => onChangeApartment(apt.id)}
                className={
                  "rounded-xl border p-4 text-left transition-colors " +
                  (active
                    ? "border-pine bg-pine text-linen"
                    : "border-mist bg-white/60 text-ink hover:border-sage")
                }
              >
                <p className="font-display text-base">{apt.label}</p>
                <p
                  className={
                    "font-mono text-[10px] uppercase tracking-[0.08em] mt-1 " +
                    (active ? "text-linen/70" : "text-ink/45")
                  }
                >
                  {apt.subtitle}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <p className="font-mono text-xs uppercase tracking-[0.14em] text-ink/50 mb-3">
          02 · Cleaning frequency
        </p>
        <div className="grid gap-3 sm:grid-cols-3">
          {FREQUENCIES.map((f) => {
            const active = f.id === frequencyId;
            return (
              <button
                type="button"
                key={f.id}
                onClick={() => onChangeFrequency(f.id)}
                className={
                  "rounded-xl border p-4 text-left transition-colors " +
                  (active
                    ? "border-pine bg-pine text-linen"
                    : "border-mist bg-white/60 text-ink hover:border-sage")
                }
              >
                <p className="font-display text-base">{f.label}</p>
                <p
                  className={
                    "text-xs mt-1 leading-snug " +
                    (active ? "text-linen/70" : "text-ink/50")
                  }
                >
                  {f.detail}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {result && (
        <div className="rounded-2xl border border-brass/40 bg-brass/[0.07] p-6">
          <p className="font-mono text-xs uppercase tracking-[0.14em] text-brass mb-4">
            Your estimate
          </p>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-ink/45">
                Per visit
              </p>
              <p className="font-display text-2xl text-ink mt-1">
                {currency(result.perVisit)}
              </p>
            </div>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-ink/45">
                Visits / month
              </p>
              <p className="font-display text-2xl text-ink mt-1">
                {result.frequency.visitsPerMonth}
              </p>
            </div>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-ink/45">
                Monthly total
              </p>
              <p className="font-display text-2xl text-pine mt-1">
                {currency(result.monthlyTotal)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

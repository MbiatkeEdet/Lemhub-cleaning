import { formatKobo } from "../lib/money";

export default function PriceCalculator({
  apartmentTypes,
  frequencies,
  apartmentCode,
  frequencyCode,
  onChangeApartment,
  onChangeFrequency,
}) {
  const apartment = apartmentTypes.find((a) => a.code === apartmentCode);
  const frequency = frequencies.find((f) => f.code === frequencyCode);
  const isCustomPricing = !!apartment?.is_custom_pricing;

  const perVisitKobo = apartment && frequency && !isCustomPricing
    ? Math.round(apartment.base_price_kobo * frequency.multiplier)
    : null;
  const monthlyTotalKobo = perVisitKobo && frequency
    ? perVisitKobo * frequency.visits_per_month
    : null;

  return (
    <div className="grid gap-8">
      <div>
        <p className="text-xs text-ink/50 mb-3">
          01 · Number of rooms
        </p>
        <RoomStepper
          apartmentTypes={apartmentTypes}
          apartmentCode={apartmentCode}
          onChange={onChangeApartment}
        />
      </div>

      <div>
        <p className="text-xs text-ink/50 mb-3">
          02 · Cleaning frequency
        </p>
        <div className="grid gap-3 sm:grid-cols-3">
          {frequencies.map((f) => {
            const active = f.code === frequencyCode;
            return (
              <button
                type="button"
                key={f.code}
                onClick={() => onChangeFrequency(f.code)}
                className={"rounded-xl border p-4 text-left transition-colors " +
                  (active
                    ? "border-pine bg-pine text-linen"
                    : "border-mist bg-white/60 text-ink hover:border-sage")
                }
              >
                <p className="font-display text-base">{f.label}</p>
                <p
                  className={"text-xs mt-1 leading-snug " +
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

      {isCustomPricing && (
        <div className="rounded-2xl border border-mist bg-linen p-6">
          <p className="text-xs text-ink/50 mb-3">
            Custom pricing
          </p>
          <p className="text-sm text-ink/70 leading-relaxed">
            {apartment.label} homes are priced individually. Request a quote below and we'll get back to you.
          </p>
        </div>
      )}

      {perVisitKobo !== null && (
        <div className="rounded-2xl border border-mist bg-linen p-6">
          <p className="text-xs text-ink/50 mb-4">
            Your estimate
          </p>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <p className="text-xs text-ink/45">
                Per visit
              </p>
              <p className="font-display text-2xl text-ink mt-1">
                {formatKobo(perVisitKobo)}
              </p>
            </div>
            <div>
              <p className="text-xs text-ink/45">
                Visits / month
              </p>
              <p className="font-display text-2xl text-ink mt-1">
                {frequency.visits_per_month}
              </p>
            </div>
            <div>
              <p className="text-xs text-ink/45">
                Monthly total
              </p>
              <p className="font-display text-2xl text-ink mt-1">
                {formatKobo(monthlyTotalKobo)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function RoomStepper({ apartmentTypes, apartmentCode, onChange }) {
  if (!apartmentTypes.length) {
    return (
      <div className="rounded-2xl border border-mist bg-white/60 p-6 text-sm text-ink/50">
        Pricing isn't available right now — please check back shortly.
      </div>
    );
  }

  const index = Math.max(
    0,
    apartmentTypes.findIndex((a) => a.code === apartmentCode)
  );
  const current = apartmentTypes[index];

  function step(delta) {
    const nextIndex = Math.min(apartmentTypes.length - 1, Math.max(0, index + delta));
    onChange(apartmentTypes[nextIndex].code);
  }

  return (
    <div className="rounded-2xl border border-mist bg-white/60 p-6">
      <div className="flex items-center justify-between gap-6">
        <button
          type="button"
          onClick={() => step(-1)}
          disabled={index <= 0}
          aria-label="Fewer rooms"
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-mist text-xl text-ink transition-colors hover:border-pine hover:text-pine disabled:opacity-30 disabled:hover:border-mist disabled:hover:text-ink"
        >
          −
        </button>

        <div className="text-center">
          <p className="font-display text-2xl text-ink">{current.label}</p>
          <p className="text-xs text-ink/45 mt-1">
            {current.subtitle}
          </p>
        </div>

        <button
          type="button"
          onClick={() => step(1)}
          disabled={index >= apartmentTypes.length - 1}
          aria-label="More rooms"
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-mist text-xl text-ink transition-colors hover:border-pine hover:text-pine disabled:opacity-30 disabled:hover:border-mist disabled:hover:text-ink"
        >
          +
        </button>
      </div>

      <div className="mt-5 flex items-center justify-center gap-1.5">
        {apartmentTypes.map((apt, i) => (
          <span
            key={apt.code}
            className={"h-1.5 rounded-full transition-all " +
              (i === index ? "w-6 bg-pine" : "w-1.5 bg-mist")
            }
          />
        ))}
      </div>
    </div>
  );
}

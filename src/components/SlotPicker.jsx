import { FALLBACK_SLOTS, SLOT_BLURB } from "../lib/slots";

/**
 * `columns` lets the caller match the space it actually has: the booking
 * step puts these in a narrow side column where two-up would wrap every
 * label, while the recurring-plan form has the full width for a 2x2.
 */
export default function SlotPicker({
  slots = FALLBACK_SLOTS,
  value,
  onChange,
  disabled = false,
  columns = 1,
}) {
  return (
    <div role="radiogroup" aria-label="Arrival time" className={"grid gap-3 " + (columns === 2 ? "sm:grid-cols-2" : "")}>
      {slots.map((slot) => {
        const active = value === slot.value;

        return (
          <button
            key={slot.value}
            type="button"
            role="radio"
            aria-checked={active}
            disabled={disabled}
            onClick={() => onChange(slot.value)}
            className={"group rounded-2xl border p-4 text-left transition-all duration-300 disabled:opacity-40 " +
              (active
                ? "border-pine bg-pine text-linen -translate-y-0.5"
                : "border-mist bg-white/70 text-ink hover:border-sage hover:-translate-y-0.5")
            }
          >
            <div className="flex items-baseline justify-between gap-3">
              <span className="font-display text-xl whitespace-nowrap">{slot.label}</span>
              <span
                className={"flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors " +
                  (active ? "border-linen bg-linen/20" : "border-mist group-hover:border-sage")
                }
                aria-hidden="true"
              >
                {active && (
                  <svg width="11" height="11" viewBox="0 0 12 12">
                    <path d="M2.5 6.4l2.4 2.4L9.5 4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </span>
            </div>
            <p className={"mt-1 text-xs " + (active ? "text-linen/70" : "text-ink/45")}>
              Arrives {slot.window}
            </p>
            <p className={"mt-2 text-xs leading-relaxed " + (active ? "text-linen/75" : "text-ink/55")}>
              {SLOT_BLURB[slot.value] || "Pick this window"}
            </p>
          </button>
        );
      })}
    </div>
  );
}

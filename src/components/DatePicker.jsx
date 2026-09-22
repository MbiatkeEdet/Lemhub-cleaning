import { useMemo, useState } from "react";
import { formatLongDate, toISODate } from "../lib/dates";

const WEEKDAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
const MONTHS = ["January", "February", "March", "April", "May", "June","July", "August", "September", "October", "November", "December",
];

/** Monday-first offset for a month's 1st, so the grid lines up under Mo…Su. */
function leadingBlanks(year, month) {
  return (new Date(year, month, 1).getDay() + 6) % 7;
}

/**
 * A calendar the customer picks service dates on. Sundays and past dates
 * are unselectable — TidyNow works Mon–Sat — and the whole thing is
 * keyboard- and screen-reader-navigable via a real button grid.
 *
 * `values` is always an array. Tapping a selected date clears it; with
 * `multiple` off, a new pick replaces the previous one.
 */
export default function DatePicker({
  values = [],
  onChange,
  multiple = false,
  maxDates = 12,
  minDate = new Date(),
  monthsAhead = 3,
  disabledWeekdays = [0], // Sunday
}) {
  const today = useMemo(() => {
    const t = new Date();
    t.setHours(0, 0, 0, 0);
    return t;
  }, []);

  const min = useMemo(() => {
    const m = new Date(minDate);
    m.setHours(0, 0, 0, 0);
    return m < today ? today : m;
  }, [minDate, today]);

  const max = useMemo(() => {
    const m = new Date(today);
    m.setMonth(m.getMonth() + monthsAhead);
    return m;
  }, [today, monthsAhead]);

  const [cursor, setCursor] = useState(() => {
    const first = [...values].sort()[0];
    const base = first ? new Date(`${first}T00:00:00`) : min;
    return { year: base.getFullYear(), month: base.getMonth() };
  });

  function toggle(iso) {
    if (!multiple) {
      onChange(values.includes(iso) ? [] : [iso]);
      return;
    }

    if (values.includes(iso)) {
      onChange(values.filter((d) => d !== iso));
      return;
    }

    if (values.length >= maxDates) return;
    onChange([...values, iso].sort());
  }

  const cells = useMemo(() => {
    const { year, month } = cursor;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const blanks = Array.from({ length: leadingBlanks(year, month) }, () => null);
    const days = Array.from({ length: daysInMonth }, (_, i) => new Date(year, month, i + 1));
    return [...blanks, ...days];
  }, [cursor]);

  function isDisabled(date) {
    if (!date) return true;
    if (date < min || date > max) return true;
    return disabledWeekdays.includes(date.getDay());
  }

  const canGoBack =
    cursor.year > min.getFullYear() ||
    (cursor.year === min.getFullYear() && cursor.month > min.getMonth());
  const canGoForward =
    cursor.year < max.getFullYear() ||
    (cursor.year === max.getFullYear() && cursor.month < max.getMonth());

  function shiftMonth(delta) {
    setCursor(({ year, month }) => {
      const d = new Date(year, month + delta, 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });
  }

  return (
    <div className="rounded-2xl border border-mist bg-white/80 p-4 sm:p-5">
      <div className="mb-4 flex items-center justify-between">
        <button
          type="button"
          onClick={() => shiftMonth(-1)}
          disabled={!canGoBack}
          aria-label="Previous month"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-mist text-ink/60 transition-colors hover:border-pine hover:text-pine disabled:opacity-30 disabled:hover:border-mist disabled:hover:text-ink/60"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
            <path d="M9 2L4 7l5 5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        <p aria-live="polite" className="font-display text-lg text-ink">
          {MONTHS[cursor.month]} {cursor.year}
        </p>

        <button
          type="button"
          onClick={() => shiftMonth(1)}
          disabled={!canGoForward}
          aria-label="Next month"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-mist text-ink/60 transition-colors hover:border-pine hover:text-pine disabled:opacity-30 disabled:hover:border-mist disabled:hover:text-ink/60"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
            <path d="M5 2l5 5-5 5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      <div className="mb-2 grid grid-cols-7 gap-1">
        {WEEKDAYS.map((d) => (
          <div key={d} className="text-center text-xs text-ink/35">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cells.map((date, i) => {
          if (!date) return <div key={`blank-${i}`} />;

          const iso = toISODate(date);
          const disabled = isDisabled(date);
          const selected = values.includes(iso);
          const isToday = iso === toISODate(today);

          return (
            <button
              key={iso}
              type="button"
              disabled={disabled}
              aria-pressed={selected}
              aria-label={formatLongDate(iso)}
              onClick={() => toggle(iso)}
              className={"relative flex aspect-square items-center justify-center rounded-xl text-sm transition-all duration-200 " +
                (selected
                  ? "bg-pine font-medium text-linen"
                  : disabled
                  ? "cursor-not-allowed text-ink/20"
                  : "text-ink/75 hover:bg-linen hover:text-pine")
              }
            >
              {date.getDate()}
              {isToday && !selected && (
                <span className="absolute bottom-1.5 h-1 w-1 rounded-full bg-ink/30" aria-hidden="true" />
              )}
            </button>
          );
        })}
      </div>

      <p className="mt-4 border-t border-mist pt-3 text-xs text-ink/45">
        We clean Monday to Saturday. Sundays are closed.
        {multiple ? ` Pick up to ${maxDates} dates — tap a date again to remove it.` : ""}
      </p>
    </div>
  );
}

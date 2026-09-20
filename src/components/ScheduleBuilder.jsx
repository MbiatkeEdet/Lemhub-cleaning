import { useEffect, useState } from "react";
import DatePicker from "./DatePicker";
import { formatLongDate, todayISO } from "../lib/dates";
import { PATTERNS, WEEKDAYS, describeRule, generateDates, horizonISO } from "../lib/schedule";

/**
 * Builds the list of dates a booking is made of.
 *
 * A repeat rule only ever *seeds* the calendar — whatever ends up selected
 * is what gets booked, so the customer can always drop the week they're
 * away without abandoning the pattern.
 */
export default function ScheduleBuilder({ dates, onChange, onPatternChange, maxVisits, monthsAhead }) {
  const [pattern, setPattern] = useState("once");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [weekdays, setWeekdays] = useState([]);
  const [touchedCalendar, setTouchedCalendar] = useState(false);

  const horizon = horizonISO(monthsAhead);
  const needsWeekdays = pattern === "weekly" || pattern === "biweekly";
  const needsEndDate = pattern !== "once" && pattern !== "custom";

  // Regenerate whenever the rule changes, unless the customer has since
  // hand-edited the calendar — their edits outrank the rule.
  useEffect(() => {
    if (pattern === "custom" || touchedCalendar || !startDate) return;
    if (needsEndDate && !endDate) return;

    onChange(generateDates({ pattern, startDate, endDate, weekdays }, maxVisits));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pattern, startDate, endDate, weekdays.join(","), touchedCalendar]);

  function choosePattern(next) {
    setPattern(next);
    onPatternChange?.(next);
    setTouchedCalendar(false);
    if (next === "custom") onChange([]);
    if (next === "once" && dates.length > 1) onChange(dates.slice(0, 1));
  }

  function toggleWeekday(value) {
    setTouchedCalendar(false);
    setWeekdays((current) =>
      current.includes(value) ? current.filter((d) => d !== value) : [...current, value].sort()
    );
  }

  function applyRuleAgain() {
    setTouchedCalendar(false);
    onChange(generateDates({ pattern, startDate, endDate, weekdays }, maxVisits));
  }

  return (
    <div className="grid gap-6">
      <div>
        <p className="mb-3 text-xs text-ink/45">How often?</p>
        <div className="grid gap-2 sm:grid-cols-3">
          {PATTERNS.map((p) => (
            <button
              type="button"
              key={p.value}
              onClick={() => choosePattern(p.value)}
              className={"rounded-xl border p-3 text-left transition-all duration-200 " +
                (pattern === p.value
                  ? "border-pine bg-pine text-linen"
                  : "border-mist bg-white/60 text-ink hover:border-sage")
              }
            >
              <p className="text-sm font-medium">{p.label}</p>
              <p className={"mt-0.5 text-xs " + (pattern === p.value ? "text-linen/70" : "text-ink/50")}>
                {p.detail}
              </p>
            </button>
          ))}
        </div>
      </div>

      {pattern !== "custom" && (
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-2">
            <span className="text-xs text-ink/45">{pattern === "once" ? "Which day?" : "Starting"}</span>
            <input
              type="date"
              value={startDate}
              min={todayISO()}
              max={horizon}
              onChange={(e) => { setStartDate(e.target.value); setTouchedCalendar(false); }}
              className="rounded-lg border border-mist bg-white px-4 py-2.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-pine/30"
            />
          </label>

          {needsEndDate && (
            <label className="grid gap-2">
              <span className="text-xs text-ink/45">Until</span>
              <input
                type="date"
                value={endDate}
                min={startDate || todayISO()}
                max={horizon}
                onChange={(e) => { setEndDate(e.target.value); setTouchedCalendar(false); }}
                className="rounded-lg border border-mist bg-white px-4 py-2.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-pine/30"
              />
              <span className="text-xs text-ink/40">You can book up to {monthsAhead} months ahead.</span>
            </label>
          )}
        </div>
      )}

      {needsWeekdays && (
        <div>
          <p className="mb-3 text-xs text-ink/45">
            Which days? Leave blank to repeat on the starting day.
          </p>
          <div className="flex flex-wrap gap-2">
            {WEEKDAYS.map((d) => (
              <button
                type="button"
                key={d.value}
                aria-pressed={weekdays.includes(d.value)}
                onClick={() => toggleWeekday(d.value)}
                className={"rounded-md border px-3.5 py-1.5 text-sm transition-colors " +
                  (weekdays.includes(d.value)
                    ? "border-pine bg-pine text-linen"
                    : "border-mist bg-white/60 text-ink/65 hover:border-sage")
                }
              >
                {d.short}
              </button>
            ))}
          </div>
        </div>
      )}

      <div>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs text-ink/45">
            {pattern === "custom"
              ? "Tap every day you want a clean"
              : "Your dates — add or remove any of them"}
          </p>
          {touchedCalendar && pattern !== "custom" && (
            <button type="button" onClick={applyRuleAgain} className="text-xs text-pine border-b border-brass pb-0.5">
              Reset to the pattern
            </button>
          )}
        </div>

        <DatePicker
          multiple
          maxDates={maxVisits}
          monthsAhead={monthsAhead}
          values={dates}
          onChange={(next) => { setTouchedCalendar(true); onChange(next); }}
        />
      </div>

      {dates.length > 0 && (
        <div className="rounded-lg border border-mist bg-linen p-4">
          <p className="mb-1 text-xs text-ink/50">
            {touchedCalendar ? `${dates.length} ${dates.length === 1 ? "visit" : "visits"} selected` : describeRule({ pattern, weekdays }, dates.length)}
          </p>
          <p className="text-sm text-ink/70">
            First visit {formatLongDate(dates[0])}
            {dates.length > 1 ? `, last ${formatLongDate(dates[dates.length - 1])}` : ""}
          </p>
          {dates.length >= maxVisits && (
            <p className="mt-2 text-xs text-clay">
              That's the maximum of {maxVisits} visits in one booking.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

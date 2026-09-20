/**
 * Helpers for the `YYYY-MM-DD` service dates the API returns.
 *
 * These parse into a *local* Date (new Date(y, m-1, d)) rather than
 * `new Date(iso)`, which would read the string as UTC midnight and show the
 * previous day to anyone west of Greenwich.
 */

function parse(iso) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

/** `2026-09-18` → `2026-09-18`, from a Date. */
export function toISODate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** "Friday, 18 September 2026" — for confirmations and headline cards. */
export function formatLongDate(iso) {
  if (!iso) return "";
  return parse(iso).toLocaleDateString(undefined, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/** "Friday, 18 September" — the same, without the year. */
export function formatDayAndMonth(iso) {
  if (!iso) return "";
  return parse(iso).toLocaleDateString(undefined, {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

/** "Fri 18 Sep" — short enough to sit inline on a dense list row. */
export function formatShortDate(iso) {
  if (!iso) return "";
  return parse(iso).toLocaleDateString(undefined, {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

/** "Sep" — for the date chip on a booking row. */
export function monthShort(iso) {
  if (!iso) return "";
  return parse(iso).toLocaleDateString(undefined, { month: "short" });
}

/** Whole days from today; negative once the date has passed. */
export function daysUntil(iso) {
  if (!iso) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((parse(iso) - today) / 86400000);
}

/** Today as `YYYY-MM-DD`, in the viewer's own timezone. */
export function todayISO() {
  return toISODate(new Date());
}

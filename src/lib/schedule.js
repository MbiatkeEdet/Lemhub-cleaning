import { toISODate, todayISO } from "./dates";

/**
 * Turns a repeat rule into the explicit list of dates a booking is made of.
 *
 * The generated list is only ever a starting point — it lands on the
 * calendar where the customer can add or remove individual days before
 * submitting, and the server is given the final list, never the rule.
 */

// Monday…Saturday. Sunday is closed, so it is not offerable at all.
export const WEEKDAYS = [
  { value: 1, short: "Mon", label: "Monday" },
  { value: 2, short: "Tue", label: "Tuesday" },
  { value: 3, short: "Wed", label: "Wednesday" },
  { value: 4, short: "Thu", label: "Thursday" },
  { value: 5, short: "Fri", label: "Friday" },
  { value: 6, short: "Sat", label: "Saturday" },
];

export const PATTERNS = [
  { value: "once", label: "Just once", detail: "A single visit on one day" },
  { value: "weekly", label: "Weekly", detail: "The same day(s) every week" },
  { value: "biweekly", label: "Every other week", detail: "The same day(s), fortnightly" },
  { value: "monthly", label: "Monthly", detail: "The same day each month" },
  { value: "range", label: "Every day in a range", detail: "Mon–Sat between two dates" },
  { value: "custom", label: "Pick exact dates", detail: "Tap the days you want on the calendar" },
];

const CLOSED_WEEKDAY = 0; // Sunday

function parse(iso) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function addDays(date, days) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function addMonths(date, months) {
  const next = new Date(date);
  const targetDay = date.getDate();
  next.setDate(1);
  next.setMonth(next.getMonth() + months);
  // Clamp so "the 31st, monthly" doesn't skip February into March.
  const daysInMonth = new Date(next.getFullYear(), next.getMonth() + 1, 0).getDate();
  next.setDate(Math.min(targetDay, daysInMonth));
  return next;
}

/** The last date a customer may book, given the horizon from the catalog. */
export function horizonISO(monthsAhead) {
  return toISODate(addMonths(new Date(), monthsAhead));
}

/**
 * @param {object} rule
 * @param {string} rule.pattern    one of PATTERNS
 * @param {string} rule.startDate  ISO
 * @param {string} rule.endDate    ISO — the horizon for repeating patterns
 * @param {number[]} rule.weekdays 0-6, Sunday excluded
 * @param {number} maxVisits
 * @returns {string[]} sorted ISO dates, Sundays and past dates removed
 */
export function generateDates(rule, maxVisits) {
  const { pattern, startDate, endDate, weekdays = [] } = rule;
  if (!startDate) return [];

  const start = parse(startDate);
  const end = endDate ? parse(endDate) : start;
  const today = parse(todayISO());
  const dates = [];

  const push = (date) => {
    if (dates.length >= maxVisits) return false;
    if (date.getDay() === CLOSED_WEEKDAY) return true;
    if (date < today || date > end) return true;
    dates.push(toISODate(date));
    return true;
  };

  if (pattern === "once") {
    push(start);
  } else if (pattern === "range") {
    for (let d = new Date(start); d <= end && dates.length < maxVisits; d = addDays(d, 1)) {
      push(d);
    }
  } else if (pattern === "weekly" || pattern === "biweekly") {
    const step = pattern === "weekly" ? 7 : 14;
    // Anchor on the week containing the start date, then walk forward.
    const days = weekdays.length ? weekdays : [start.getDay()];
    const weekStart = addDays(start, -((start.getDay() + 6) % 7)); // back to Monday

    for (let w = new Date(weekStart); w <= end && dates.length < maxVisits; w = addDays(w, step)) {
      for (const weekday of [...days].sort()) {
        // Monday-indexed offset within this week.
        const offset = (weekday + 6) % 7;
        push(addDays(w, offset));
      }
    }
  } else if (pattern === "monthly") {
    for (let d = new Date(start); d <= end && dates.length < maxVisits; d = addMonths(d, 1)) {
      // A monthly date landing on a Sunday moves to the Monday rather than
      // silently vanishing from the schedule.
      push(d.getDay() === CLOSED_WEEKDAY ? addDays(d, 1) : d);
    }
  }

  return [...new Set(dates)].sort();
}

/** Human summary of what was generated, for the review line. */
export function describeRule(rule, count) {
  const visits = `${count} ${count === 1 ? "visit" : "visits"}`;

  if (rule.pattern === "custom") return `${visits}, hand-picked`;
  if (rule.pattern === "once") return "A single visit";

  const days = rule.weekdays?.length
    ? WEEKDAYS.filter((d) => rule.weekdays.includes(d.value)).map((d) => d.short).join(", ")
    : null;

  const base = {
    weekly: "Weekly",
    biweekly: "Every other week",
    monthly: "Monthly",
    range: "Every working day",
  }[rule.pattern];

  return days ? `${base} on ${days} — ${visits}` : `${base} — ${visits}`;
}

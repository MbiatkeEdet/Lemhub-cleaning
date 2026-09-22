/**
 * Chart colour for the TidyNow consoles.
 *
 * The rule that keeps these charts quiet: colour is only spent when it
 * carries meaning. A single-series trend is INK — it needs no hue at all,
 * because the title already says what it is. CATEGORICAL is reserved for
 * charts where several named things sit side by side, and it caps at four:
 * a fifth muted hue could not clear the colourblind-separation and chroma
 * checks, so a fifth series folds into "Other" rather than inventing one.
 *
 * The four below pass the lightness-band, chroma-floor, CVD-separation,
 * normal-vision and contrast checks against the paper surface. Changing a
 * value means re-running that validation.
 */
export const CATEGORICAL = [
  "#0B7A5C", // green
  "#B8761A", // ochre
  "#2263BE", // blue
  "#B33468", // magenta
];

/** The default for anything single-series: graphite, not a hue. */
export const INK = "#17171A";
export const ACCENT = "#1F5F4B";
export const GRID = "#E7E6E3";
export const SURFACE = "#FFFFFF";
export const MUTED = "#8A8A82";

/** One hue, light → dark, for magnitude (the schedule heatmap). */
export const SEQUENTIAL = [
  "#F2F5F3",
  "#DCE7E2",
  "#BAD2C9",
  "#8FB8AB",
  "#5C9A87",
  "#1F5F4B",
];

/** Reserved for state. Never reused as "series 5"; always paired with a label. */
export const STATUS = {
  good: "#1F6B4E",
  warning: "#96701B",
  serious: "#A65A24",
  critical: "#A6342A",
  neutral: "#8A8A82",
};

/**
 * Booking lifecycle. Deliberately a progression from grey to accent rather
 * than seven competing hues — the states are ordered, so lightness reads
 * better than colour, and cancelled is the only one that earns red.
 */
export const BOOKING_STATUS_COLOR = {
  pending_confirmation: "#C6C5BE",
  awaiting_payment_manual: "#A5A49B",
  confirmed: "#7D9E91",
  assigned: "#4E8A78",
  in_progress: "#2F6F5A",
  completed: "#1F5F4B",
  cancelled: "#A6342A",
};

export function seriesColor(index) {
  return CATEGORICAL[index % CATEGORICAL.length];
}

/** Maps a 0–1 magnitude onto the sequential ramp. */
export function rampColor(fraction) {
  if (!Number.isFinite(fraction) || fraction <= 0) return SEQUENTIAL[0];
  const i = Math.min(SEQUENTIAL.length - 1, Math.floor(fraction * SEQUENTIAL.length));
  return SEQUENTIAL[i];
}

export function formatCompact(n) {
  return new Intl.NumberFormat("en-NG", { notation: "compact", maximumFractionDigits: 1 }).format(n || 0);
}

export function formatPercent(n, digits = 1) {
  if (n === null || n === undefined) return "—";
  return `${Number(n).toFixed(digits)}%`;
}

// Base price per single clean, by apartment size (NGN)
export const APARTMENT_TYPES = [
  { id: "studio", label: "Studio", subtitle: "Single open room", base: 10000 },
  { id: "1bed", label: "1 Bedroom", subtitle: "1 bed · 1 bath", base: 15000 },
  { id: "2bed", label: "2 Bedroom", subtitle: "2 bed · 1-2 bath", base: 20000 },
  { id: "3bed", label: "3 Bedroom", subtitle: "3 bed · 2 bath", base: 25000 },
  { id: "4bed", label: "4+ Bedroom", subtitle: "Duplex / townhouse", base: 25000 },
  {id: "5bed", label: "5+ Bedroom", subtitle: "Large homes / estates", base: 30000}
];

// Frequency plans: visits per month + per-visit discount multiplier
export const FREQUENCIES = [
  {
    id: "onetime",
    label: "One-time",
    detail: "A single deep clean, no commitment",
    visitsPerMonth: 1,
    multiplier: 1,
  },
  {
    id: "biweekly",
    label: "Twice a month",
    detail: "Every other week — the balanced choice",
    visitsPerMonth: 2,
    multiplier: 0.9,
  },
  {
    id: "weekly",
    label: "Weekly",
    detail: "Every week — for homes that stay guest-ready",
    visitsPerMonth: 4,
    multiplier: 0.82,
  },
];

export function currency(n) {
  return "₦" + Math.round(n).toLocaleString("en-NG");
}

export function calculatePrice(apartmentId, frequencyId) {
  const apt = APARTMENT_TYPES.find((a) => a.id === apartmentId);
  const freq = FREQUENCIES.find((f) => f.id === frequencyId);
  if (!apt || !freq) return null;
  const perVisit = apt.base * freq.multiplier;
  const monthlyTotal = perVisit * freq.visitsPerMonth;
  return {
    apartment: apt,
    frequency: freq,
    perVisit,
    monthlyTotal,
  };
}

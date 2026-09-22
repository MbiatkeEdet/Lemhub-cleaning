/**
 * Mirrors App\Services\Pricing\DiscountCalculator so the form can quote a
 * price without a round trip. The tiers come from the catalog rather than
 * being duplicated here — the server stays the only place they're defined,
 * and the server always recomputes before charging anything.
 */

export function discountBps(visits, paidUpfront, pricing) {
  if (!pricing || visits < 2) return 0;

  let bps = 0;
  for (const tier of pricing.recurring_discount_tiers || []) {
    if (visits >= tier.min_visits) {
      bps = tier.bps;
      break;
    }
  }

  if (paidUpfront) bps += pricing.upfront_discount_bps || 0;

  return Math.min(bps, pricing.max_discount_bps ?? bps);
}

/** Rounds down, matching the server, so the quote is never under the charge. */
export function applyDiscount(amountKobo, bps) {
  if (bps <= 0) return amountKobo;
  return Math.floor((amountKobo * (10000 - bps)) / 10000);
}

/** `150` → `"1.5%"`, `500` → `"5%"`. */
export function formatBps(bps) {
  const percent = bps / 100;
  return `${Number.isInteger(percent) ? percent : percent.toFixed(1)}%`;
}

/**
 * The next rung on the ladder, so the form can nudge: "add 2 more dates for
 * 0.8%". Returns null once they're at the cap.
 */
export function nextTier(visits, pricing) {
  const tiers = [...(pricing?.recurring_discount_tiers || [])].sort((a, b) => a.min_visits - b.min_visits);
  return tiers.find((t) => t.min_visits > visits) || null;
}

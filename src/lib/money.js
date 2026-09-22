export function formatKobo(kobo) {
  return "₦" + Math.round(kobo / 100).toLocaleString("en-NG");
}

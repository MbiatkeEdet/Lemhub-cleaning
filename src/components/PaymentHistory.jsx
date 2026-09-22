import { useEffect, useState } from "react";
import { fetchMyPayments } from "../lib/api";
import { formatDayAndMonth } from "../lib/dates";
import { formatKobo } from "../lib/money";

const STATUS_STYLES = {
  successful: "bg-pine/10 text-pine",
  pending: "bg-brass/15 text-ink/70",
  initiated: "bg-mist text-ink/55",
  failed: "bg-clay/10 text-clay",
  refunded: "bg-mist text-ink/55",
};

const PURPOSE_LABELS = {
  booking_payment: "Clean",
  tip: "Tip",
  card_verification: "Card check",
};

export default function PaymentHistory() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchMyPayments()
      .then(setPayments)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="h-24 animate-pulse rounded-2xl border border-mist bg-white/40" />;
  }

  if (error) {
    return <p className="rounded-xl border border-mist bg-white/60 p-6 text-sm text-clay">{error}</p>;
  }

  if (payments.length === 0) {
    return (
      <p className="rounded-xl border border-mist bg-white/60 p-6 text-sm text-ink/55">
        Nothing charged yet. Every payment — cleans, tips and card checks — shows up here.
      </p>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-mist bg-white/60">
      <ul className="divide-y divide-mist">
        {payments.map((p) => (
          <li key={p.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
            <div className="min-w-0">
              <p className="text-sm text-ink">
                {PURPOSE_LABELS[p.purpose] || "Payment"}
                {p.booking_date ? ` · visit on ${formatDayAndMonth(p.booking_date)}` : ""}
              </p>
              <p className="mt-0.5 truncate text-xs text-ink/45">
                {formatDayAndMonth(p.created_at)} · {p.gateway || "—"} · {p.reference}
              </p>
              {p.failure_reason ? (
                <p className="mt-1 text-xs text-clay">{p.failure_reason}</p>
              ) : null}
            </div>
            <div className="flex items-center gap-3">
              <span className="font-display text-base text-ink">{formatKobo(p.amount_kobo)}</span>
              <span
                className={"rounded-full px-2.5 py-0.5 text-xs " + (STATUS_STYLES[p.status] || STATUS_STYLES.initiated)}
              >
                {p.status}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

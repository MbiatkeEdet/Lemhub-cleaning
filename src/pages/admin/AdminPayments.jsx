import { useEffect, useState } from "react";
import ConfirmDialog from "../../components/ConfirmDialog";
import MetricTile from "../../components/MetricTile";
import {
  adminConfirmManualPayment,
  adminRejectManualPayment,
  fetchAdminManualPaymentProofUrl,
  fetchAdminPendingManualPayments,
} from "../../lib/api";
import { formatShortDate } from "../../lib/dates";
import { formatKobo } from "../../lib/money";

export default function AdminPayments() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actioningId, setActioningId] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [rejectTarget, setRejectTarget] = useState(null);
  const [rejectReason, setRejectReason] = useState("");

  function load() {
    return fetchAdminPendingManualPayments().then(setTransactions);
  }

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, []);

  async function handleViewProof(id) {
    try {
      const url = await fetchAdminManualPaymentProofUrl(id);
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleConfirm(id) {
    setActioningId(id);
    setError("");
    setNotice("");
    try {
      await adminConfirmManualPayment(id);
      await load();
      setNotice("Payment confirmed. The customer has been emailed a receipt and the booking is queued for assignment.");
    } catch (err) {
      setError(err.message);
    } finally {
      setActioningId(null);
    }
  }

  async function handleReject() {
    if (!rejectTarget) return;
    setActioningId(rejectTarget.id);
    setError("");
    setNotice("");
    try {
      await adminRejectManualPayment(rejectTarget.id, rejectReason.trim());
      await load();
      setNotice("Payment rejected. The customer has been emailed so they know to check the transfer.");
      setRejectTarget(null);
      setRejectReason("");
    } catch (err) {
      setError(err.message);
    } finally {
      setActioningId(null);
    }
  }

  const withProof = transactions.filter((t) => t.has_proof).length;
  const totalKobo = transactions.reduce((sum, t) => sum + t.amount_kobo, 0);

  return (
    <div className="mx-auto max-w-5xl px-6 py-8 lg:px-10 lg:py-12">
      <section className="relative overflow-hidden rounded-xl border border-mist gradient-brand p-7 lg:p-9">
        <div className="relative">
          <p className="mb-3 text-xs text-pine/65">
            Manual payments
          </p>
          <h1 className="mb-4 font-display text-3xl leading-tight text-ink lg:text-4xl">
            Bank transfers waiting on a decision.
          </h1>
          <p className="max-w-2xl leading-relaxed text-ink/65">
            Each of these bookings is held but unconfirmed. Confirming emails the customer a receipt
            and queues the booking for a cleaner; rejecting emails them to check the transfer.
          </p>
        </div>
      </section>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <MetricTile
          label="Awaiting review"
          value={transactions.length}
          tone={transactions.length > 0 ? "urgent" : "default"}
        />
        <MetricTile
          label="With proof uploaded"
          value={withProof}
          hint={
            transactions.length - withProof > 0
              ? `${transactions.length - withProof} still waiting on a receipt`
              : "Every one has a receipt attached"
          }
        />
        <MetricTile label="Value held" value={formatKobo(totalKobo)} />
      </div>

      {notice && (
        <p className="mt-6 rounded-2xl border border-sage-dim bg-sage/10 px-4 py-3 text-sm text-pine">
          {notice}
        </p>
      )}
      {error && (
        <p role="alert" className="mt-6 rounded-2xl border border-clay/20 bg-clay/[0.05] px-4 py-3 text-sm text-clay">
          {error}
        </p>
      )}

      <div className="mt-6">
        {loading ? (
          <div className="grid gap-3">
            {[0, 1].map((i) => (
              <div key={i} className="h-28 animate-pulse rounded-2xl border border-mist bg-white/40" />
            ))}
          </div>
        ) : transactions.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-mist bg-white/40 px-6 py-12 text-center text-ink/55">
            Nothing waiting on confirmation.
          </div>
        ) : (
          <div className="grid gap-3">
            {transactions.map((t) => (
              <article key={t.id} className="rounded-2xl border border-mist bg-white/70 px-5 py-4">
                <div className="mb-3 flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="font-display text-lg text-ink">{t.booking.customer_name}</p>
                    <p className="text-xs text-pine">
                      {t.booking.scheduled_date
                        ? `${formatShortDate(t.booking.scheduled_date)}${
                            t.booking.scheduled_slot_window
                              ? ` · arrives ${t.booking.scheduled_slot_window}`
                              : ""
                          }`
                        : "No date scheduled"}
                    </p>
                    <p className="mt-0.5 text-xs text-ink/50">
                      Booking #{t.booking.id} · {t.booking.apartment_label}
                      {t.booking.customer_phone ? ` · ${t.booking.customer_phone}` : ""}
                    </p>
                    <p className="mt-1 text-xs text-ink/40">Ref {t.reference}</p>
                  </div>

                  <div className="shrink-0 text-right">
                    <p className="font-display text-xl text-ink">{formatKobo(t.amount_kobo)}</p>
                    <span
                      className={"mt-1 inline-block rounded-md border px-2.5 py-0.5 text-sm font-medium " +
                        (t.has_proof
                          ? "border-sage-dim bg-sage/15 text-pine"
                          : "border-brass/30 bg-ink/30/10 text-ink/50")
                      }
                    >
                      {t.has_proof ? "Proof attached" : "No proof yet"}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 border-t border-mist pt-3">
                  <button
                    type="button"
                    disabled={actioningId === t.id}
                    onClick={() => handleConfirm(t.id)}
                    className="rounded-md bg-pine px-5 py-2 text-sm font-medium text-linen transition-colors hover:bg-pine-light disabled:opacity-50"
                  >
                    {actioningId === t.id ? "Working…" : "Confirm payment"}
                  </button>
                  <button
                    type="button"
                    disabled={actioningId === t.id}
                    onClick={() => {
                      setRejectTarget(t);
                      setRejectReason("");
                    }}
                    className="text-xs text-clay/80 transition-colors hover:text-clay disabled:opacity-50"
                  >
                    Reject
                  </button>
                  {t.has_proof && (
                    <button
                      type="button"
                      onClick={() => handleViewProof(t.id)}
                      className="ml-auto border-b border-ink/30 pb-0.5 text-xs text-pine"
                    >
                      View proof
                    </button>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={!!rejectTarget}
        title="Reject this transfer?"
        description={
          rejectTarget
            ? `${rejectTarget.booking.customer_name} · ${formatKobo(rejectTarget.amount_kobo)}. They'll be emailed so they know to check the transfer — the booking stays held.`
            : ""
        }
        tone="danger"
        confirmLabel="Reject payment"
        cancelLabel="Keep reviewing"
        busy={actioningId === rejectTarget?.id}
        onConfirm={handleReject}
        onClose={() => setRejectTarget(null)}
      >
        <label className="mt-4 block text-left">
          <span className="mb-2 block text-xs text-ink/45">
            Reason (optional — included in the email)
          </span>
          <textarea
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            rows={3}
            placeholder="e.g. the receipt shows ₦5,000 but the booking is ₦18,000"
            className="w-full resize-none rounded-xl border border-mist bg-white/80 px-4 py-3 text-sm text-ink placeholder:text-ink/30 focus:border-pine focus:outline-none"
          />
        </label>
      </ConfirmDialog>
    </div>
  );
}

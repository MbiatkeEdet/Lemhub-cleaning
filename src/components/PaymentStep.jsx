import { useEffect, useState } from "react";
import {
  fetchAvailableGateways,
  initiatePayment,
  requestManualFollowUp,
  uploadPaymentProof,
} from "../lib/api";
import { formatKobo } from "../lib/money";

const GATEWAY_LABELS = {
  paystack: "Pay with card (Paystack)",
  flutterwave: "Pay with card (Flutterwave)",
  bank_transfer_manual: "Bank transfer",
};

export default function PaymentStep({ booking }) {
  const [phase, setPhase] = useState("loading");
  const [gateways, setGateways] = useState([]);
  const [error, setError] = useState("");
  const [manualDetails, setManualDetails] = useState(null);
  const [reference, setReference] = useState(null);
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Paying before each visit needs a card we can charge again later, so
  // bank transfer isn't offerable on those orders — the API refuses it too.
  const needsReusableCard = booking.group && booking.group.payment_mode === "per_visit";

  useEffect(() => {
    fetchAvailableGateways()
      .then(async (all) => {
        const available = needsReusableCard
          ? all.filter((g) => g.code !== "bank_transfer_manual")
          : all;

        setGateways(available);

        if (available.length === 0) {
          await requestManualFollowUp(booking.id).catch(() => {});
          setPhase("none-available");
        } else {
          setPhase("picker");
        }
      })
      .catch((err) => {
        setError(err.message);
        setPhase("error");
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function startPayment(code) {
    setError("");
    setPhase("initiating");
    try {
      const result = await initiatePayment(booking.id, code);
      if (result.redirect_url) {
        setPhase("redirecting");
        window.location.href = result.redirect_url;
      } else {
        setManualDetails(result.meta);
        setReference(result.reference);
        setPhase("manual");
      }
    } catch (err) {
      setError(err.message);
      setPhase("picker");
    }
  }

  async function handleProofSubmit(e) {
    e.preventDefault();
    if (!file) {
      setError("Attach a screenshot or PDF of your transfer receipt.");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      await uploadPaymentProof(booking.id, file);
      setPhase("manual-submitted");
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (phase === "loading" || phase === "initiating" || phase === "redirecting") {
    return (
      <div className="rounded-2xl border border-mist bg-white/60 p-6 text-center text-ink/50">
        {phase === "redirecting" ? "Redirecting you to pay…" : "Loading payment options…"}
      </div>
    );
  }

  if (phase === "error") {
    return (
      <div className="rounded-2xl border border-mist bg-white/60 p-6 text-center text-clay">
        {error || "We couldn't load payment options. Please refresh."}
      </div>
    );
  }

  if (phase === "none-available") {
    return (
      <div className="rounded-2xl border border-mist bg-linen p-6 text-center">
        <p className="text-ink/70">
          Online payment isn't available right now — we'll reach out shortly to arrange payment for your booking.
        </p>
      </div>
    );
  }

  if (phase === "manual-submitted") {
    return (
      <div className="rounded-2xl border border-mist bg-linen p-6 text-center">
        <p className="text-ink/70">
          Thanks — we've received your proof of payment and will confirm your booking shortly.
        </p>
      </div>
    );
  }

  if (phase === "manual" && manualDetails) {
    return (
      <div className="rounded-2xl border border-mist bg-white/60 p-6">
        <p className="text-xs text-ink/50 mb-4">
          Bank transfer details
        </p>
        <div className="grid gap-2 mb-4 text-sm">
          <Row label="Bank" value={manualDetails.bank_name} />
          <Row label="Account name" value={manualDetails.account_name} />
          <Row label="Account number" value={manualDetails.account_number} />
          <Row label="Amount" value={formatKobo(booking.amount_due_now_kobo ?? booking.per_visit_price_kobo)} />
          {reference && <Row label="Use as narration" value={reference} />}
        </div>

        <p className="mb-6 rounded-xl border border-sage-dim bg-sage/10 px-4 py-3 text-xs leading-relaxed text-pine">
          We've emailed these details to you as well, so you don't have to keep this page open.
          Transfer the exact amount, then upload your receipt below — we confirm within a few hours.
        </p>
        {manualDetails.instructions && (
          <p className="text-xs text-ink/50 mb-6">{manualDetails.instructions}</p>
        )}
        <form onSubmit={handleProofSubmit} className="grid gap-4">
          <label className="block">
            <span className="mb-2 block text-xs text-ink/45">
              Upload proof of payment
            </span>
            <input
              type="file"
              accept="image/*,.pdf"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="w-full text-sm text-ink"
            />
          </label>
          {error && <p className="text-sm text-clay">{error}</p>}
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center justify-center rounded-md bg-pine px-6 py-3 text-sm font-medium text-linen disabled:opacity-60"
          >
            {submitting ? "Uploading…" : "Submit proof of payment"}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-mist bg-white/60 p-6">
      <p className="text-xs text-ink/50 mb-4">
        Choose how to pay
      </p>
      <div className="grid gap-3">
        {gateways.map((g) => (
          <button
            key={g.code}
            type="button"
            onClick={() => startPayment(g.code)}
            className="rounded-xl border border-mist bg-white/70 p-4 text-left text-sm text-ink hover:border-pine transition-colors"
          >
            {GATEWAY_LABELS[g.code] || g.display_name}
          </button>
        ))}
      </div>
      {error && <p className="mt-4 text-sm text-clay">{error}</p>}
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-ink/45">{label}</span>
      <span className="text-ink">{value}</span>
    </div>
  );
}

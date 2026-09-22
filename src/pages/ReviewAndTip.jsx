import { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import SealBadge from "../components/SealBadge";
import { fetchBookingCompletion, payTip, submitBookingReview, verifyPayment } from "../lib/api";
import { formatKobo } from "../lib/money";

const TIP_PRESETS_NAIRA = [500, 1000, 2000];

export default function ReviewAndTip() {
  const { bookingId } = useParams();
  const [searchParams] = useSearchParams();
  const linkParams = useMemo(() => {
    const params = {};
    if (searchParams.get("expires")) params.expires = searchParams.get("expires");
    if (searchParams.get("signature")) params.signature = searchParams.get("signature");
    return params;
  }, [searchParams]);

  const [context, setContext] = useState(null);
  const [phase, setPhase] = useState("loading");
  const [tipJustPaid, setTipJustPaid] = useState(false);

  function load() {
    return fetchBookingCompletion(bookingId, linkParams)
      .then((data) => {
        setContext(data);
        setPhase("ready");
      })
      .catch((err) => {
        setPhase(err.status === 422 ? "not-completed" : "unauthorized");
      });
  }

  useEffect(() => {
    const tipReference = searchParams.get("tip_reference");
    if (!tipReference) {
      load();
      return;
    }

    verifyPayment(tipReference)
      .then((result) => {
        if (result.status === "successful") setTipJustPaid(true);
      })
      .finally(load);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (phase === "loading") {
    return <div className="mx-auto max-w-xl px-6 py-24 text-center text-ink/50">Loading…</div>;
  }

  if (phase === "unauthorized") {
    return (
      <div className="mx-auto max-w-xl px-6 py-24 text-center">
        <h1 className="font-display text-2xl text-ink mb-3">This link isn't valid.</h1>
        <p className="text-ink/60 leading-relaxed">
          It may have expired. Sign in to your dashboard to review a past booking instead.
        </p>
      </div>
    );
  }

  if (phase === "not-completed") {
    return (
      <div className="mx-auto max-w-xl px-6 py-24 text-center">
        <h1 className="font-display text-2xl text-ink mb-3">Not quite ready yet.</h1>
        <p className="text-ink/60 leading-relaxed">
          You can leave a review and tip once your cleaning is marked complete.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl px-6 py-20">
      <div className="flex justify-center mb-8">
        <SealBadge size={80} />
      </div>
      <p className="text-xs text-ink/45 mb-3 text-center">
        {context.apartment_label}
      </p>
      <h1 className="font-display text-3xl text-ink mb-10 text-center">
        {context.cleaner_first_name ? `How was your visit with ${context.cleaner_first_name}?` : "How was your clean?"}
      </h1>

      {tipJustPaid && (
        <div className="mb-8 rounded-xl border border-sage-dim bg-sage/10 px-5 py-4 text-center text-sm text-pine">
          Thank you — your tip went straight to {context.cleaner_first_name || "your cleaner"}.
        </div>
      )}

      <ReviewSection bookingId={bookingId} linkParams={linkParams} context={context} onSubmitted={load} />
      <TipSection bookingId={bookingId} linkParams={linkParams} context={context} />
    </div>
  );
}

function ReviewSection({ bookingId, linkParams, context, onSubmitted }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (context.already_reviewed) {
    return (
      <div className="mb-10 rounded-2xl border border-mist bg-white/60 p-6 text-center text-sm text-ink/60">
        Thanks — you've already reviewed this booking.
      </div>
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!rating) {
      setError("Pick a star rating first.");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      await submitBookingReview(bookingId, linkParams, { rating, comment: comment.trim() || null });
      await onSubmitted();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mb-10 rounded-2xl border border-mist bg-white/60 p-6">
      <p className="text-xs text-ink/50 mb-4">Leave a review</p>
      <div className="flex justify-center gap-2 mb-5">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setRating(n)}
            aria-label={`${n} star${n > 1 ? "s" : ""}`}
            className={"text-3xl transition-colors " + (n <= rating ? "text-ink/50" : "text-mist")}
          >
            ★
          </button>
        ))}
      </div>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={3}
        placeholder="Anything you'd like to share? (optional)"
        className="w-full rounded-xl border border-mist bg-white/70 px-4 py-3 text-sm text-ink placeholder:text-ink/30 focus:outline-none focus:border-pine resize-none mb-4"
      />
      {error && <p className="mb-4 text-sm text-clay">{error}</p>}
      <button
        type="submit"
        disabled={submitting}
        className="inline-flex items-center rounded-md bg-pine px-6 py-3 text-sm font-medium text-linen disabled:opacity-60"
      >
        {submitting ? "Submitting…" : "Submit review"}
      </button>
    </form>
  );
}

function TipSection({ bookingId, linkParams, context }) {
  const [amountNaira, setAmountNaira] = useState(TIP_PRESETS_NAIRA[1]);
  const [customAmount, setCustomAmount] = useState("");
  const [gatewayCode, setGatewayCode] = useState(context.tip_gateways[0]?.code || "");
  const [phase, setPhase] = useState("idle");
  const [error, setError] = useState("");

  const effectiveNaira = customAmount ? Number(customAmount) : amountNaira;
  const canTip = context.has_saved_card || context.tip_gateways.length > 0;

  if (!canTip) {
    return null;
  }

  async function handleTip(useSavedCard) {
    if (!effectiveNaira || effectiveNaira < 100) {
      setError("Tips start at ₦100.");
      return;
    }
    setError("");
    setPhase("paying");
    try {
      const payload = { amount_kobo: Math.round(effectiveNaira * 100) };
      if (useSavedCard) {
        payload.use_saved_card = true;
      } else {
        payload.gateway_code = gatewayCode;
      }
      const result = await payTip(bookingId, linkParams, payload);
      if (result.redirect_url) {
        window.location.href = result.redirect_url;
        return;
      }
      setPhase("paid");
    } catch (err) {
      setError(err.message);
      setPhase("idle");
    }
  }

  if (phase === "paid") {
    return (
      <div className="rounded-2xl border border-sage-dim bg-sage/10 p-6 text-center text-sm text-pine">
        Thank you — 100% of your tip goes straight to your cleaner.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-mist bg-white/60 p-6">
      <p className="text-xs text-ink/50 mb-2">
        Leave a tip
      </p>
      <p className="text-sm text-ink/60 mb-5">
        100% of every tip goes straight to your cleaner — nothing is kept by TidyNow.
      </p>

      <div className="flex flex-wrap gap-2 mb-4">
        {TIP_PRESETS_NAIRA.map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => {
              setAmountNaira(n);
              setCustomAmount("");
            }}
            className={"rounded-md px-4 py-2 text-sm font-medium border " +
              (!customAmount && amountNaira === n
                ? "border-pine bg-pine text-linen"
                : "border-mist text-ink/60 hover:text-ink")
            }
          >
            {formatKobo(n * 100)}
          </button>
        ))}
        <input
          type="number"
          min="100"
          value={customAmount}
          onChange={(e) => setCustomAmount(e.target.value)}
          placeholder="Custom (₦)"
          className="w-28 rounded-md border border-mist bg-white/70 px-4 py-2 text-sm font-medium text-ink placeholder:text-ink/30 focus:outline-none focus:border-pine"
        />
      </div>

      {!context.has_saved_card && context.tip_gateways.length > 1 && (
        <select
          value={gatewayCode}
          onChange={(e) => setGatewayCode(e.target.value)}
          className="mb-4 w-full rounded-xl border border-mist bg-white/70 px-4 py-3 text-sm text-ink focus:outline-none focus:border-pine"
        >
          {context.tip_gateways.map((g) => (
            <option key={g.code} value={g.code}>
              {g.display_name}
            </option>
          ))}
        </select>
      )}

      {error && <p className="mb-4 text-sm text-clay">{error}</p>}

      <div className="flex flex-wrap gap-3">
        {context.has_saved_card && (
          <button
            type="button"
            disabled={phase === "paying"}
            onClick={() => handleTip(true)}
            className="inline-flex items-center rounded-md bg-pine px-6 py-3 text-sm font-medium text-linen disabled:opacity-60"
          >
            {phase === "paying" ? "Sending…" : "Tip with saved card"}
          </button>
        )}
        {context.tip_gateways.length > 0 && (
          <button
            type="button"
            disabled={phase === "paying"}
            onClick={() => handleTip(false)}
            className="inline-flex items-center rounded-md border border-ink/20 px-6 py-3 text-sm font-medium text-ink disabled:opacity-60"
          >
            {phase === "paying" ? "Redirecting…" : "Pay by card"}
          </button>
        )}
      </div>
    </div>
  );
}

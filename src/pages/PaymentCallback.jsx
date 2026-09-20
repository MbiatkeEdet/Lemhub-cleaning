import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import SealBadge from "../components/SealBadge";
import { verifyPayment } from "../lib/api";

export default function PaymentCallback() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("checking");

  useEffect(() => {
    const reference =
      searchParams.get("reference") || searchParams.get("trxref") || searchParams.get("tx_ref");

    if (!reference) {
      setStatus("unknown");
      return;
    }

    verifyPayment(reference)
      .then((result) => setStatus(result.status))
      .catch(() => setStatus("unknown"));
  }, [searchParams]);

  return (
    <div className="mx-auto max-w-xl px-6 py-24 text-center">
      {status === "successful" ? (
        <>
          <div className="flex justify-center mb-8">
            <SealBadge size={96} />
          </div>
          <h1 className="font-display text-3xl text-ink mb-3">Payment confirmed.</h1>
          <p className="text-ink/60 leading-relaxed mb-8">
            Your booking is confirmed — we'll match you with a verified cleaner shortly.
          </p>
        </>
      ) : status === "checking" ? (
        <p className="text-ink/50">Confirming your payment…</p>
      ) : status === "pending" ? (
        <>
          <h1 className="font-display text-2xl text-ink mb-3">Still confirming.</h1>
          <p className="text-ink/60 leading-relaxed">
            Your payment is still being confirmed by the provider — this can take a minute. We'll
            update your booking automatically once it clears.
          </p>
        </>
      ) : (
        <>
          <h1 className="font-display text-2xl text-ink mb-3">Payment not completed.</h1>
          <p className="text-ink/60 leading-relaxed mb-8">
            It looks like this payment didn't go through. No charge was made — you can try again
            or reach out and we'll help.
          </p>
        </>
      )}
      <Link
        to="/"
        className="inline-block mt-4 text-xs text-pine border-b border-ink/30 pb-0.5"
      >
        Back to home →
      </Link>
    </div>
  );
}

import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { verifyPayment } from "../lib/api";

/**
 * Where the gateway drops the customer after the small charge that vaults
 * their card. The card itself is saved server-side during verification —
 * this page only reports what happened.
 */
export default function CardCallback() {
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
      {status === "checking" ? (
        <p className="text-ink/50">Confirming your card…</p>
      ) : status === "successful" ? (
        <>
          <h1 className="mb-3 font-display text-3xl text-ink">Card saved.</h1>
          <p className="leading-relaxed text-ink/60">
            We'll use it for your repeat cleans. You can change or remove it any time from your
            dashboard.
          </p>
        </>
      ) : status === "pending" ? (
        <>
          <h1 className="mb-3 font-display text-2xl text-ink">Still confirming.</h1>
          <p className="leading-relaxed text-ink/60">
            Your provider hasn't finished confirming this card. It will appear in your dashboard
            once it clears.
          </p>
        </>
      ) : (
        <>
          <h1 className="mb-3 font-display text-2xl text-ink">Card not saved.</h1>
          <p className="leading-relaxed text-ink/60">
            That didn't go through, so nothing was saved. You can try again from your dashboard.
          </p>
        </>
      )}
      <Link to="/dashboard" className="mt-8 inline-block text-xs text-pine border-b border-ink/30 pb-0.5">
        Back to your dashboard →
      </Link>
    </div>
  );
}

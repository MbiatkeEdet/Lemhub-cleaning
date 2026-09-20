import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { unsubscribeEmail } from "../lib/api";

export default function Unsubscribe() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("working");
  const [error, setError] = useState("");

  useEffect(() => {
    const customerId = searchParams.get("customer");
    const expires = searchParams.get("expires");
    const signature = searchParams.get("signature");

    if (!customerId || !expires || !signature) {
      setStatus("error");
      return;
    }

    unsubscribeEmail({ customer_id: Number(customerId), expires: Number(expires), signature })
      .then(() => setStatus("done"))
      .catch((err) => {
        setError(err.message);
        setStatus("error");
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="mx-auto max-w-xl px-6 py-24 text-center">
      {status === "working" && <p className="text-ink/50">Unsubscribing…</p>}
      {status === "done" && (
        <>
          <h1 className="font-display text-2xl text-ink mb-3">You're unsubscribed.</h1>
          <p className="text-ink/60 leading-relaxed">
            You won't receive marketing emails from us anymore. You'll still get emails about any
            bookings you make.
          </p>
        </>
      )}
      {status === "error" && (
        <>
          <h1 className="font-display text-2xl text-ink mb-3">This link isn't valid.</h1>
          <p className="text-ink/60 leading-relaxed">
            {error || "It may have expired. Reach out to us if you'd still like to unsubscribe."}
          </p>
        </>
      )}
    </div>
  );
}

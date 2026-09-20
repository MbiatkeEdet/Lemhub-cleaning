import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { requestOtp, verifyOtp } from "../lib/api";

/**
 * Creates a verified, signed-in session without leaving the booking form.
 *
 * Deliberately the same emailed-code flow as the login page rather than a
 * typed password: a booking that will be charged again later has to be tied
 * to an email the person actually controls, and accepting a password on a
 * merely typed address would hand anyone an account under someone else's
 * email.
 */
export default function InlineAccountStep({ email, onEmailChange, reason }) {
  const auth = useAuth();
  const [stage, setStage] = useState("email");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (auth.isAuthenticated) {
    return (
      <div className="rounded-xl border border-pine/20 bg-pine/[0.04] p-5">
        <p className="text-sm text-ink">
          Signed in as <span className="font-medium">{auth.user?.email || email}</span>.
        </p>
        <p className="mt-1 text-xs text-ink/55">
          Your visits and your saved card live in your dashboard.
        </p>
      </div>
    );
  }

  async function handleSendCode(e) {
    e.preventDefault();
    if (!email.trim()) {
      setError("Enter your email address so we can verify it.");
      return;
    }
    setError("");
    setBusy(true);
    try {
      await requestOtp(email.trim());
      setStage("code");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleVerify(e) {
    e.preventDefault();
    if (code.trim().length !== 6) {
      setError("Enter the 6-digit code we emailed you.");
      return;
    }
    setError("");
    setBusy(true);
    try {
      const { token } = await verifyOtp(email.trim(), code.trim());
      await auth.login(token);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-xl border border-mist bg-white/60 p-5">
      <p className="text-sm text-ink/70">{reason}</p>

      {stage === "email" ? (
        <form onSubmit={handleSendCode} className="mt-4 grid gap-3">
          <label className="text-xs text-ink/50" htmlFor="account-email">
            Email address
          </label>
          <input
            id="account-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
            placeholder="chioma@example.com"
            className="w-full rounded-lg border border-mist bg-white px-4 py-2.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-pine/30"
          />
          <button
            type="submit"
            disabled={busy}
            className="justify-self-start rounded-md bg-pine px-6 py-2.5 text-sm font-medium text-linen hover:bg-pine-light disabled:opacity-60"
          >
            {busy ? "Sending…" : "Email me a code"}
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerify} className="mt-4 grid gap-3">
          <label className="text-xs text-ink/50" htmlFor="account-code">
            6-digit code sent to {email}
          </label>
          <input
            id="account-code"
            inputMode="numeric"
            autoComplete="one-time-code"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
            placeholder="123456"
            className="w-full max-w-xs rounded-lg border border-mist bg-white px-4 py-2.5 text-lg tracking-[0.3em] text-ink focus:outline-none focus:ring-2 focus:ring-pine/30"
          />
          <div className="flex items-center gap-4">
            <button
              type="submit"
              disabled={busy}
              className="rounded-md bg-pine px-6 py-2.5 text-sm font-medium text-linen hover:bg-pine-light disabled:opacity-60"
            >
              {busy ? "Verifying…" : "Verify and continue"}
            </button>
            <button
              type="button"
              onClick={() => { setStage("email"); setCode(""); setError(""); }}
              className="text-xs text-ink/50 hover:text-ink"
            >
              Use a different email
            </button>
          </div>
        </form>
      )}

      {error ? <p className="mt-3 text-sm text-clay">{error}</p> : null}
    </div>
  );
}

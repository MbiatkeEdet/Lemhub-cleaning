import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import GoogleSignInButton from "../components/GoogleSignInButton";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { googleLogin, requestOtp, verifyOtp } from "../lib/api";
import { GOOGLE_ENABLED } from "../lib/env";

export default function Login() {
  const auth = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [step, setStep] = useState("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const ROLE_HOME = {
    admin: "/admin",
    support_agent: "/support",
    cleaner: "/cleaner",
  };

  async function afterLogin({ token }) {
    const user = await auth.login(token);
    navigate(ROLE_HOME[user?.role] || "/dashboard");
  }

  const handleGoogleCredential = useCallback(async (idToken) => {
    setError("");
    setSubmitting(true);
    try {
      const result = await googleLogin(idToken);
      await afterLogin(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleRequestCode(e) {
    e.preventDefault();
    if (!email.trim()) {
      setError("Enter your email address.");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      await requestOtp(email.trim());
      setStep("code");
      toast.info(`We emailed a 6-digit code to ${email.trim()}.`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleVerifyCode(e) {
    e.preventDefault();
    if (code.trim().length !== 6) {
      setError("Enter the 6-digit code we emailed you.");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      const result = await verifyOtp(email.trim(), code.trim());
      await afterLogin(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-16 lg:py-24">
      <div className="grid gap-10 lg:grid-cols-[1fr_1.05fr] lg:items-center">
        <div className="hidden lg:block">
          <p className="text-xs text-ink/50 mb-4">TidyNow</p>
          <h2 className="font-display text-4xl text-ink leading-tight mb-5 max-w-md">
            Verified cleaners, one login away.
          </h2>
          <p className="text-ink/60 leading-relaxed max-w-sm mb-8">
            Sign in to manage bookings, track your cleaner, and see your schedule — no passwords to remember.
          </p>
          <ul className="grid gap-3 text-sm text-ink/70">
            <li className="flex items-center gap-3">
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-ink/30" />
              Passwordless — a code emailed to you or Google sign-in
            </li>
            <li className="flex items-center gap-3">
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-ink/30" />
              Every cleaner background-checked and trained
            </li>
            <li className="flex items-center gap-3">
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-ink/30" />
              Manage recurring plans and payments in one place
            </li>
          </ul>
        </div>

        <div>
          <p className="text-xs text-ink/45 mb-3">
            Sign in
          </p>
          <h1 className="font-display text-3xl text-ink mb-3">
            {step === "email" ? "Welcome back." : "Check your email."}
          </h1>
          <p className="text-ink/60 leading-relaxed mb-8">
            {step === "email"
              ? "No passwords — sign in with Google or a code emailed to you."
              : `We sent a 6-digit code to ${email}.`}
          </p>

          <div className="rounded-xl border border-mist bg-white/70 p-6 lg:p-8">
            {GOOGLE_ENABLED && (
              <div className="flex justify-center mb-6">
                <GoogleSignInButton onCredential={handleGoogleCredential} />
              </div>
            )}

            {step === "email" && (
              <>
                {GOOGLE_ENABLED && (
                  <div className="relative mb-6 flex items-center gap-3 text-ink/35">
                    <span className="h-px flex-1 bg-mist" />
                    <span className="text-xs">or use email</span>
                    <span className="h-px flex-1 bg-mist" />
                  </div>
                )}
                <form onSubmit={handleRequestCode} className="grid gap-4">
                  <Field
                    label="Email"
                    type="email"
                    value={email}
                    onChange={setEmail}
                    placeholder="you@example.com"
                  />
                  {error && <p className="rounded-xl border border-clay/20 bg-clay/[0.05] px-4 py-3 text-sm text-clay">{error}</p>}
                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex items-center justify-center rounded-md bg-pine px-6 py-3.5 text-sm font-medium text-linen hover:bg-pine-light transition-colors disabled:opacity-60"
                  >
                    {submitting ? "Sending…" : "Email me a code"}
                  </button>
                </form>
              </>
            )}

            {step === "code" && (
              <form onSubmit={handleVerifyCode} className="grid gap-4">
                <Field
                  label="6-digit code"
                  value={code}
                  onChange={setCode}
                  placeholder="123456"
                />
                {error && <p className="rounded-xl border border-clay/20 bg-clay/[0.05] px-4 py-3 text-sm text-clay">{error}</p>}
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center justify-center rounded-md bg-pine px-6 py-3.5 text-sm font-medium text-linen hover:bg-pine-light transition-colors disabled:opacity-60"
                >
                  {submitting ? "Verifying…" : "Verify & sign in"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setStep("email");
                    setCode("");
                    setError("");
                  }}
                  className="text-xs text-ink/50 hover:text-ink"
                >
                  Use a different email
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder, type = "text" }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs text-ink/45">
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-mist bg-white/80 px-4 py-3 text-sm text-ink placeholder:text-ink/30 focus:outline-none focus:border-pine focus:ring-2 focus:ring-pine/15 transition-shadow"
      />
    </label>
  );
}

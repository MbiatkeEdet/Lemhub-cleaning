import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";

const AUTH_KEY = "linenpress_auth";

export default function Landing() {
  const navigate = useNavigate();
  const { user, completeBasicKyc } = useApp();
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ fullName: "", email: "", password: "" });
  const [error, setError] = useState("");

  function handleSubmit(e) {
    e.preventDefault();

    if (!form.email.trim() || !form.password.trim()) {
      setError("Please enter your email and password.");
      return;
    }

    if (mode === "signup" && !form.fullName.trim()) {
      setError("Please enter your full name to create an account.");
      return;
    }

    const existing = JSON.parse(localStorage.getItem(AUTH_KEY) || "{}") || {};
    const key = form.email.trim().toLowerCase();

    if (mode === "signup") {
      if (existing[key]) {
        setError("An account with this email already exists.");
        return;
      }

      existing[key] = {
        fullName: form.fullName.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
      };
      localStorage.setItem(AUTH_KEY, JSON.stringify(existing));
      completeBasicKyc({
        fullName: form.fullName.trim(),
        email: form.email.trim().toLowerCase(),
        phone: "",
        address: "",
      });
      setError("");
      navigate("/kyc");
      return;
    }

    const account = existing[key];
    if (!account || account.password !== form.password) {
      setError("Invalid email or password.");
      return;
    }

    completeBasicKyc({
      fullName: account.fullName,
      email: account.email,
      phone: "",
      address: "",
    });
    setError("");
    navigate("/kyc");
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      <img
        src="/cleaning2.jpg"
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.2),_transparent_40%),linear-gradient(120deg,rgba(16,24,20,0.78),rgba(16,24,20,0.45))]" />
      <div className="relative z-10 flex min-h-screen items-center justify-center px-6 py-16">
        <div className="w-full max-w-6xl overflow-hidden rounded-[2.2rem] border border-white/20 bg-white/90 shadow-[0_35px_120px_rgba(0,0,0,0.3)] backdrop-blur-xl">
          <div className="grid lg:grid-cols-[1.08fr_0.92fr]">
            <div className="relative overflow-hidden bg-[linear-gradient(135deg,rgba(120,155,129,0.16),rgba(255,255,255,0.95))] px-8 py-10 md:px-12 md:py-14">
              <div className="absolute -right-8 top-0 h-40 w-40 rounded-full bg-brass/10 blur-3xl" />
              <div className="relative">
                <p className="font-mono text-xs uppercase tracking-[0.16em] text-brass">LuxeClean</p>
                <h1 className="mt-4 max-w-xl font-display text-4xl leading-[1.02] text-ink md:text-5xl lg:text-6xl">
                  Trusted cleaning, curated for a calmer home.
                </h1>
                <p className="mt-6 max-w-lg text-base leading-relaxed text-ink/70">
                  Create an account or sign in to access verified cleaners, complete KYC, and reserve your next clean with confidence.
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <div className="rounded-full border border-pine/20 bg-white/80 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.14em] text-ink/70">
                    Verified professionals
                  </div>
                  <div className="rounded-full border border-pine/20 bg-white/80 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.14em] text-ink/70">
                    Secure onboarding
                  </div>
                </div>
                <div className="mt-8 rounded-[1.5rem] border border-mist bg-white/80 p-5 text-sm text-ink/70 shadow-sm">
                  <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-ink/45">Why it matters</p>
                  <p className="mt-2 leading-relaxed">
                    Every booking begins with a secure profile and identity verification so your home is handled by the right people.
                  </p>
                </div>
              </div>
            </div>

            <div className="px-8 py-10 md:px-12 md:py-14">
              <div className="flex items-center gap-3 rounded-full border border-mist bg-linen-dim p-1.5 w-fit">
                <button
                  type="button"
                  onClick={() => setMode("login")}
                  className={`rounded-full px-4 py-2 font-mono text-[11px] uppercase tracking-[0.14em] transition-colors ${mode === "login" ? "bg-pine text-linen shadow-sm" : "text-ink/70"}`}
                >
                  Login
                </button>
                <button
                  type="button"
                  onClick={() => setMode("signup")}
                  className={`rounded-full px-4 py-2 font-mono text-[11px] uppercase tracking-[0.14em] transition-colors ${mode === "signup" ? "bg-pine text-linen shadow-sm" : "text-ink/70"}`}
                >
                  Sign up
                </button>
              </div>

              <form onSubmit={handleSubmit} className="mt-8 space-y-4">
                {mode === "signup" && (
                  <Field
                    label="Full name"
                    value={form.fullName}
                    onChange={(v) => setForm({ ...form, fullName: v })}
                    placeholder="Chioma Eze"
                  />
                )}
                <Field
                  label="Email"
                  value={form.email}
                  onChange={(v) => setForm({ ...form, email: v })}
                  placeholder="you@example.com"
                  type="email"
                />
                <Field
                  label="Password"
                  value={form.password}
                  onChange={(v) => setForm({ ...form, password: v })}
                  placeholder="Enter a secure password"
                  type="password"
                />

                {error && <p className="text-sm text-clay">{error}</p>}

                <button
                  type="submit"
                  className="w-full rounded-full bg-pine px-6 py-3.5 font-mono text-xs uppercase tracking-[0.14em] text-linen transition-colors hover:bg-pine-light"
                >
                  {mode === "signup" ? "Create account" : "Sign in"}
                </button>
              </form>

              <p className="mt-6 text-sm text-ink/60">
                {mode === "signup"
                  ? "Already have an account?"
                  : "New here?"} {" "}
                <button
                  type="button"
                  onClick={() => setMode(mode === "signup" ? "login" : "signup")}
                  className="font-mono text-[11px] uppercase tracking-[0.14em] text-pine"
                >
                  {mode === "signup" ? "Sign in instead" : "Create one"}
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder, type = "text" }) {
  return (
    <label className="block">
      <span className="mb-2 block font-mono text-[11px] uppercase tracking-[0.1em] text-ink/45">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-mist bg-white/80 px-4 py-3 text-sm text-ink placeholder:text-ink/30 focus:outline-none focus:border-pine"
      />
    </label>
  );
}

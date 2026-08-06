import { useEffect, useState } from "react";
import { useApp } from "../context/AppContext";
import SealBadge from "../components/SealBadge";

const emptyForm = {
  name: "",
  years: "",
  bio: "",
  specialties: "",
  areas: "",
};

const ADMIN_PASSWORD = "LuxeCleanAdmin";
const ACCESS_KEY = "agency-portal-access";

export default function AgencyPortal() {
  const { cleaners, addCleaner, removeCleaner, bookings } = useApp();
  const [form, setForm] = useState(emptyForm);
  const [justAdded, setJustAdded] = useState(null);
  const [error, setError] = useState("");
  const [password, setPassword] = useState("");
  const [isAuthorized, setIsAuthorized] = useState(() => {
    if (typeof window === "undefined") return false;
    return sessionStorage.getItem(ACCESS_KEY) === "true";
  });

  useEffect(() => {
    if (isAuthorized) {
      sessionStorage.setItem(ACCESS_KEY, "true");
    } else {
      sessionStorage.removeItem(ACCESS_KEY);
    }
  }, [isAuthorized]);

  function handlePasswordSubmit(e) {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsAuthorized(true);
      setError("");
      setPassword("");
      return;
    }

    setError("Incorrect admin password.");
    setPassword("");
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim() || !form.bio.trim()) {
      setError("Name and a short bio are required.");
      return;
    }
    setError("");
    const record = addCleaner({
      name: form.name.trim(),
      years: Number(form.years) || 0,
      bio: form.bio.trim(),
      specialties: form.specialties
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      areas: form.areas
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    });
    setJustAdded(record);
    setForm(emptyForm);
  }

  if (!isAuthorized) {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-md items-center justify-center px-4 py-12 sm:px-6 sm:py-20">
        <div className="w-full rounded-[2rem] border border-mist bg-white/70 p-6 text-center shadow-[0_20px_60px_rgba(33,36,31,0.08)] sm:p-8">
          <p className="font-mono text-xs uppercase tracking-[0.14em] text-ink/45 mb-3">
            Restricted area
          </p>
          <h1 className="font-display text-2xl text-ink sm:text-3xl">
            Admin access required
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-ink/60">
            This portal is reserved for the agency admin. Enter the password to continue.
          </p>

          <form onSubmit={handlePasswordSubmit} className="mt-8 text-left">
            <Field
              label="Admin password"
              value={password}
              onChange={setPassword}
              placeholder="Enter password"
              type="password"
            />
            {error && <p className="mt-3 text-sm text-clay">{error}</p>}
            <button
              type="submit"
              className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-pine px-7 py-3.5 font-mono text-xs uppercase tracking-[0.14em] text-linen transition-colors hover:bg-pine-light"
            >
              Enter portal
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.14em] text-ink/45 mb-3">
            Agency portal
          </p>
          <h1 className="font-display mb-4 text-3xl text-ink sm:text-4xl">
            Issue the seal to a new cleaner.
          </h1>
          <p className="max-w-lg text-sm leading-relaxed text-ink/60 sm:text-base">
            Add cleaners who have completed background checks and an in-home
            trial. They'll appear on the client-facing roster immediately.
          </p>
        </div>
        <button
          onClick={() => setIsAuthorized(false)}
          className="self-start font-mono text-[11px] uppercase tracking-[0.12em] text-ink/55 transition-colors hover:text-ink sm:self-auto"
        >
          Logout
        </button>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr] lg:gap-12">
        <form onSubmit={handleSubmit} className="rounded-2xl border border-mist bg-white/60 p-5 sm:p-8">
          <div className="grid gap-5">
            <Field
              label="Full name"
              value={form.name}
              onChange={(v) => setForm({ ...form, name: v })}
              placeholder="Ngozi Eze"
            />
            <Field
              label="Years of experience"
              value={form.years}
              onChange={(v) => setForm({ ...form, years: v })}
              placeholder="5"
              type="number"
            />
            <TextArea
              label="Short bio"
              value={form.bio}
              onChange={(v) => setForm({ ...form, bio: v })}
              placeholder="What makes their work distinctive?"
            />
            <Field
              label="Specialties (comma separated)"
              value={form.specialties}
              onChange={(v) => setForm({ ...form, specialties: v })}
              placeholder="Deep cleaning, Laundry"
            />
            <Field
              label="Service areas (comma separated)"
              value={form.areas}
              onChange={(v) => setForm({ ...form, areas: v })}
              placeholder="Port Harcourt, GRA Phase 2"
            />
          </div>

          {error && <p className="mt-4 text-sm text-clay">{error}</p>}

          <button
            type="submit"
            className="mt-7 inline-flex w-full items-center justify-center rounded-full bg-pine px-7 py-3.5 font-mono text-xs uppercase tracking-[0.14em] text-linen transition-colors hover:bg-pine-light sm:w-auto"
          >
            Verify &amp; add cleaner
          </button>

          {justAdded && (
            <div className="mt-6 flex items-center gap-3 rounded-xl border border-brass/40 bg-brass/[0.08] px-4 py-3">
              <SealBadge size={32} />
              <p className="text-sm text-ink/70">
                <span className="font-display text-ink">{justAdded.name}</span>{" "}
                has been added to the roster.
              </p>
            </div>
          )}
        </form>

        <div className="min-w-0">
          <div className="mb-5 flex items-center justify-between">
            <p className="font-mono text-xs uppercase tracking-[0.14em] text-ink/50">
              Current roster ({cleaners.length})
            </p>
          </div>
          <div className="grid max-h-[420px] gap-4 overflow-y-auto pr-1">
            {cleaners.map((c) => (
              <div
                key={c.id}
                className="flex flex-col gap-3 rounded-xl border border-mist bg-white/50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-pine/10 font-display text-sm text-pine">
                    {c.initials}
                  </div>
                  <div>
                    <p className="font-display text-ink">{c.name}</p>
                    <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-ink/40">
                      Verified {c.verifiedOn}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => removeCleaner(c.id)}
                  className="font-mono text-[11px] uppercase tracking-[0.1em] text-clay/70 transition-colors hover:text-clay"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          <p className="mt-10 mb-5 font-mono text-xs uppercase tracking-[0.14em] text-ink/50">
            Recent booking requests ({bookings.length})
          </p>
          {bookings.length === 0 ? (
            <p className="text-sm text-ink/45">No requests yet.</p>
          ) : (
            <div className="grid max-h-[280px] gap-3 overflow-y-auto pr-1">
              {bookings.map((b) => (
                <div
                  key={b.id}
                  className="rounded-xl border border-mist bg-white/50 px-5 py-4"
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <p className="font-display text-ink">{b.client.name}</p>
                    <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-brass">
                      {b.status}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-ink/50">
                    {b.apartmentLabel} · {b.frequencyLabel} · {b.client.address}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder, type = "text" }) {
  return (
    <label className="block">
      <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-ink/45 mb-2 block">
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-mist bg-white/70 px-4 py-3 text-sm text-ink placeholder:text-ink/30 focus:outline-none focus:border-pine"
      />
    </label>
  );
}

function TextArea({ label, value, onChange, placeholder }) {
  return (
    <label className="block">
      <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-ink/45 mb-2 block">
        {label}
      </span>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={3}
        className="w-full rounded-xl border border-mist bg-white/70 px-4 py-3 text-sm text-ink placeholder:text-ink/30 focus:outline-none focus:border-pine resize-none"
      />
    </label>
  );
}

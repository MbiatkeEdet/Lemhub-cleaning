import { useState } from "react";
import { useApp } from "../context/AppContext";
import SealBadge from "../components/SealBadge";

const emptyForm = {
  name: "",
  years: "",
  bio: "",
  specialties: "",
  areas: "",
};

export default function AgencyPortal() {
  const { cleaners, addCleaner, removeCleaner, bookings } = useApp();
  const [form, setForm] = useState(emptyForm);
  const [justAdded, setJustAdded] = useState(null);
  const [error, setError] = useState("");

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

  return (
    <div className="mx-auto max-w-6xl px-6 py-20">
      <p className="font-mono text-xs uppercase tracking-[0.14em] text-ink/45 mb-3">
        Agency portal
      </p>
      <h1 className="font-display text-4xl text-ink mb-4">
        Issue the seal to a new cleaner.
      </h1>
      <p className="text-ink/60 leading-relaxed mb-12 max-w-lg">
        Add cleaners who have completed background checks and an in-home
        trial. They'll appear on the client-facing roster immediately.
      </p>

      <div className="grid lg:grid-cols-[1fr_1.2fr] gap-12">
        <form onSubmit={handleSubmit} className="rounded-2xl border border-mist bg-white/60 p-8">
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
            className="mt-7 inline-flex items-center rounded-full bg-pine px-7 py-3.5 font-mono text-xs uppercase tracking-[0.14em] text-linen hover:bg-pine-light transition-colors"
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

        <div>
          <div className="flex items-center justify-between mb-5">
            <p className="font-mono text-xs uppercase tracking-[0.14em] text-ink/50">
              Current roster ({cleaners.length})
            </p>
          </div>
          <div className="grid gap-4 max-h-[420px] overflow-y-auto pr-1">
            {cleaners.map((c) => (
              <div
                key={c.id}
                className="flex items-center justify-between rounded-xl border border-mist bg-white/50 px-5 py-4"
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
                  className="font-mono text-[11px] uppercase tracking-[0.1em] text-clay/70 hover:text-clay"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          <p className="font-mono text-xs uppercase tracking-[0.14em] text-ink/50 mt-10 mb-5">
            Recent booking requests ({bookings.length})
          </p>
          {bookings.length === 0 ? (
            <p className="text-sm text-ink/45">No requests yet.</p>
          ) : (
            <div className="grid gap-3 max-h-[280px] overflow-y-auto pr-1">
              {bookings.map((b) => (
                <div
                  key={b.id}
                  className="rounded-xl border border-mist bg-white/50 px-5 py-4"
                >
                  <div className="flex items-center justify-between">
                    <p className="font-display text-ink">{b.client.name}</p>
                    <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-brass">
                      {b.status}
                    </span>
                  </div>
                  <p className="text-xs text-ink/50 mt-1">
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

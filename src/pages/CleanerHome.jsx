import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import CleanerJobsPanel from "../components/CleanerJobsPanel";
import MetricTile from "../components/MetricTile";
import PhoneField from "../components/PhoneField";
import { fetchCleanerApplication, fetchCleanerJobStats, updateCleanerProfile } from "../lib/api";
import { formatKobo } from "../lib/money";

export default function CleanerHome() {
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchCleanerApplication(), fetchCleanerJobStats()])
      .then(([data, jobStats]) => {
        setProfile(data.profile);
        setStats(jobStats);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-16">
        <div className="h-40 animate-pulse rounded-xl bg-mist/40" />
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-2xl bg-mist/25" />
          ))}
        </div>
      </div>
    );
  }

  if (!profile) {
    return <Navigate to="/cleaner/apply" replace />;
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-10 lg:py-14">
      <section className="relative overflow-hidden rounded-xl border border-mist gradient-brand p-7 lg:p-9">
        <div className="relative grid gap-6 sm:grid-cols-[1.2fr_0.8fr] sm:items-end">
          <div>
            <p className="mb-3 text-xs text-pine/65">
              Cleaner dashboard
            </p>
            <h1 className="mb-3 font-display text-3xl leading-tight text-ink lg:text-4xl">
              Welcome, {profile.display_first_name}.
            </h1>
            <p className="max-w-lg leading-relaxed text-ink/65">
              {stats?.today_count
                ? `You have ${stats.today_count} job${stats.today_count === 1 ? "" : "s"} scheduled today.`
                : stats?.active_count
                ? "Nothing on today — your next assigned job is listed below."
                : "No jobs assigned right now. We'll notify you the moment one comes in."}
            </p>
          </div>

          <div className="rounded-2xl border border-white/70 bg-white/75 p-4 shadow-sm backdrop-blur">
            <p className="mb-1 text-xs text-ink/45">
              Tips waiting to be paid out
            </p>
            <p className="font-display text-2xl text-pine">
              {formatKobo(stats?.unpaid_tips_kobo ?? 0)}
            </p>
            <p className="mt-1 text-xs text-ink/50">
              {formatKobo(stats?.lifetime_tips_paid_kobo ?? 0)} paid to you so far
            </p>
          </div>
        </div>
      </section>

      {stats && (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricTile
            label="Jobs today"
            value={stats.today_count ?? 0}
            hint={`${stats.this_week_count ?? 0} in the next 7 days`}
          />
          <MetricTile
            label="Active jobs"
            value={stats.active_count}
            hint="Assigned or in progress"
          />
          <MetricTile
            label="Completed"
            value={stats.completed_total}
            hint={`${stats.completed_this_month ?? 0} this month`}
          />
          <MetricTile
            label="Your rating"
            value={
              stats.rating_count > 0 && stats.rating_avg !== null
                ? `★ ${stats.rating_avg.toFixed(1)}`
                : "No ratings yet"
            }
            hint={stats.rating_count > 0 ? `From ${stats.rating_count} reviews` : "Complete a job to start earning reviews"}
          />
        </div>
      )}

      <div className="my-10">
        <CleanerJobsPanel />
      </div>

      <ProfileForm profile={profile} onUpdated={setProfile} />
    </div>
  );
}

function ProfileForm({ profile, onUpdated }) {
  const [form, setForm] = useState({
    bio: profile.bio || "",
    years_experience: profile.years_experience || "",
    specialties: (profile.specialties || []).join(", "),
    service_areas: (profile.service_areas || []).join(", "),
    phone: profile.phone || "",
    payout_bank_name: profile.payout_bank_name || "",
    payout_account_name: profile.payout_account_name || "",
    payout_account_number: profile.payout_account_number || "",
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      const updated = await updateCleanerProfile({
        bio: form.bio.trim() || null,
        years_experience: form.years_experience ? Number(form.years_experience) : null,
        specialties: form.specialties.split(",").map((s) => s.trim()).filter(Boolean),
        service_areas: form.service_areas.split(",").map((s) => s.trim()).filter(Boolean),
        phone: form.phone.trim() || null,
        payout_bank_name: form.payout_bank_name.trim() || null,
        payout_account_name: form.payout_account_name.trim() || null,
        payout_account_number: form.payout_account_number.trim() || null,
      });
      onUpdated(updated);
      setMessage("Profile updated.");
    } catch (err) {
      setMessage(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSave} className="rounded-2xl border border-mist bg-white/60 p-6">
      <p className="text-xs text-ink/50 mb-5">
        Your profile
      </p>
      <div className="grid gap-4">
        <TextArea label="Bio" value={form.bio} onChange={(v) => setForm({ ...form, bio: v })} />
        <Field
          label="Years of experience"
          value={form.years_experience}
          onChange={(v) => setForm({ ...form, years_experience: v })}
          type="number"
        />
        <Field
          label="Specialties (comma separated)"
          value={form.specialties}
          onChange={(v) => setForm({ ...form, specialties: v })}
          placeholder="Deep cleaning, Laundry"
        />
        <Field
          label="Service areas (comma separated)"
          value={form.service_areas}
          onChange={(v) => setForm({ ...form, service_areas: v })}
          placeholder="Port Harcourt, GRA Phase 2"
        />
        <PhoneField
          label="Contact phone"
          value={form.phone}
          onChange={(v) => setForm({ ...form, phone: v })}
          required={false}
        />
      </div>

      <p className="text-xs text-ink/50 mt-8 mb-5">
        Payout details (for tips)
      </p>
      <div className="grid gap-4">
        <Field
          label="Bank name"
          value={form.payout_bank_name}
          onChange={(v) => setForm({ ...form, payout_bank_name: v })}
        />
        <Field
          label="Account name"
          value={form.payout_account_name}
          onChange={(v) => setForm({ ...form, payout_account_name: v })}
        />
        <Field
          label="Account number"
          value={form.payout_account_number}
          onChange={(v) => setForm({ ...form, payout_account_number: v })}
        />
      </div>

      {message && <p className="mt-4 text-sm text-ink/60">{message}</p>}

      <button
        type="submit"
        disabled={saving}
        className="mt-6 inline-flex items-center rounded-md bg-pine px-6 py-3 text-sm font-medium text-linen disabled:opacity-60"
      >
        {saving ? "Saving…" : "Save profile"}
      </button>
    </form>
  );
}

function Field({ label, value, onChange, placeholder, type = "text" }) {
  return (
    <label className="block">
      <span className="text-xs text-ink/45 mb-2 block">
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

function TextArea({ label, value, onChange }) {
  return (
    <label className="block">
      <span className="text-xs text-ink/45 mb-2 block">
        {label}
      </span>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
        className="w-full rounded-xl border border-mist bg-white/70 px-4 py-3 text-sm text-ink placeholder:text-ink/30 focus:outline-none focus:border-pine resize-none"
      />
    </label>
  );
}

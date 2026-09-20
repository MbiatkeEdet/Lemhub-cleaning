import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { applyForSupport, fetchSupportApplication } from "../lib/api";

const STATUS_COPY = {
  pending: {
    title: "Application submitted.",
    body: "Thanks for applying — an admin will review it and get back to you soon.",
  },
  rejected: {
    title: "We couldn't approve your application.",
    body: "If you think this is a mistake, reach out to support and we'll take another look.",
  },
};

export default function SupportApply() {
  const { user } = useAuth();
  const [application, setApplication] = useState(null);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchSupportApplication()
      .then(setApplication)
      .finally(() => setLoading(false));
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const result = await applyForSupport({ note: note.trim() || null });
      setApplication({ status: result.status, note: note.trim() || null, rejection_reason: null });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <div className="mx-auto max-w-2xl px-6 py-24 text-center text-ink/50">Loading…</div>;
  }

  if (user?.role === "support_agent" || user?.role === "admin") {
    return (
      <div className="mx-auto max-w-2xl px-6 py-24 text-center">
        <h1 className="font-display text-3xl text-ink mb-4">You're already on the team.</h1>
        <Link
          to="/support/console"
          className="text-xs text-pine border-b border-ink/30 pb-0.5"
        >
          Open the support console →
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-20">
      <p className="text-xs text-ink/45 mb-3">
        Support team
      </p>
      <h1 className="font-display text-4xl text-ink mb-4">
        {application ? "Your application" : "Join the TidyNow support team."}
      </h1>
      <p className="text-ink/60 leading-relaxed mb-10 max-w-lg">
        Help both registered and guest customers with their bookings, KYC questions, and general
        inquiries. An admin reviews every application.
      </p>

      {application && STATUS_COPY[application.status] && (
        <div className="rounded-2xl border border-mist bg-white/60 p-8 text-center">
          <h2 className="font-display text-2xl text-ink mb-3">
            {STATUS_COPY[application.status].title}
          </h2>
          <p className="text-ink/60 leading-relaxed">{STATUS_COPY[application.status].body}</p>
          {application.status === "rejected" && application.rejection_reason && (
            <p className="mt-4 text-sm text-clay">{application.rejection_reason}</p>
          )}
          {application.status === "rejected" && (
            <button
              type="button"
              onClick={() => setApplication(null)}
              className="mt-6 text-xs text-pine border-b border-ink/30 pb-0.5"
            >
              Apply again
            </button>
          )}
        </div>
      )}

      {!application && (
        <form onSubmit={handleSubmit} className="rounded-2xl border border-mist bg-white/60 p-6">
          <label className="block">
            <span className="mb-2 block text-xs text-ink/45">
              Why do you want to join? (optional)
            </span>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={4}
              className="w-full rounded-xl border border-mist bg-white/70 px-4 py-3 text-sm text-ink placeholder:text-ink/30 focus:outline-none focus:border-pine resize-none"
            />
          </label>
          {error && <p className="mt-4 text-sm text-clay">{error}</p>}
          <button
            type="submit"
            disabled={submitting}
            className="mt-6 inline-flex items-center rounded-md bg-pine px-6 py-3 text-sm font-medium text-linen disabled:opacity-60"
          >
            {submitting ? "Submitting…" : "Submit application"}
          </button>
        </form>
      )}
    </div>
  );
}

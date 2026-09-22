import { useEffect, useState } from "react";
import {
  adminApproveSupportApplication,
  adminRejectSupportApplication,
  fetchAdminSupportApplications,
} from "../../lib/api";

export default function AdminSupportApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actioningId, setActioningId] = useState(null);
  const [error, setError] = useState("");

  function load() {
    return fetchAdminSupportApplications().then(setApplications);
  }

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, []);

  async function handleApprove(id) {
    setActioningId(id);
    setError("");
    try {
      await adminApproveSupportApplication(id);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setActioningId(null);
    }
  }

  async function handleReject(id) {
    const reason = window.prompt("Reason for rejecting this application:");
    if (!reason) return;
    setActioningId(id);
    setError("");
    try {
      await adminRejectSupportApplication(id, reason);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setActioningId(null);
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <p className="text-xs text-ink/45 mb-3">Admin</p>
      <h1 className="font-display text-3xl text-ink mb-8">Support team applications</h1>

      {error && <p className="mb-4 text-sm text-clay">{error}</p>}

      {loading ? (
        <p className="text-ink/50">Loading…</p>
      ) : applications.length === 0 ? (
        <p className="text-ink/50">No applications waiting on review.</p>
      ) : (
        <div className="grid gap-3">
          {applications.map((app) => (
            <div key={app.id} className="rounded-xl border border-mist bg-white/60 px-5 py-4">
              <div className="flex items-center justify-between gap-4 mb-3">
                <div>
                  <p className="font-display text-ink">{app.applicant_name}</p>
                  <p className="text-xs text-ink/50">{app.applicant_email}</p>
                </div>
                <span className="text-xs text-ink/40">
                  {new Date(app.created_at).toLocaleDateString()}
                </span>
              </div>
              {app.note && <p className="text-sm text-ink/70 mb-3">{app.note}</p>}
              <div className="flex gap-3">
                <button
                  type="button"
                  disabled={actioningId === app.id}
                  onClick={() => handleApprove(app.id)}
                  className="text-xs text-pine border-b border-ink/30 pb-0.5 disabled:opacity-50"
                >
                  Approve
                </button>
                <button
                  type="button"
                  disabled={actioningId === app.id}
                  onClick={() => handleReject(app.id)}
                  className="text-xs text-clay/80 border-b border-clay/40 pb-0.5 disabled:opacity-50"
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

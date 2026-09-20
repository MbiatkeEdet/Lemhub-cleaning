import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchAdminCleanerApplications } from "../../lib/api";

export default function AdminCleanerApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminCleanerApplications()
      .then(setApplications)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <p className="text-xs text-ink/45 mb-3">
        Admin
      </p>
      <h1 className="font-display text-3xl text-ink mb-8">Cleaner applications</h1>

      {loading ? (
        <p className="text-ink/50">Loading…</p>
      ) : applications.length === 0 ? (
        <p className="text-ink/50">No applications waiting on review.</p>
      ) : (
        <div className="grid gap-3">
          {applications.map((app) => (
            <Link
              key={app.id}
              to={`/admin/applications/${app.id}`}
              className="flex items-center justify-between rounded-xl border border-mist bg-white/60 px-5 py-4 hover:border-pine transition-colors"
            >
              <div>
                <p className="font-display text-ink">{app.full_legal_name}</p>
                <p className="text-xs text-ink/50">{app.applicant_email}</p>
              </div>
              <span className="text-xs text-ink/50">
                {app.status.replace(/_/g, " ")}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

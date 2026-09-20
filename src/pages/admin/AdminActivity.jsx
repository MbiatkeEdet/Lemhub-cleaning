import { useEffect, useState } from "react";
import { fetchAdminAuditLog, fetchAdminEmailLog } from "../../lib/api";

export default function AdminActivity() {
  const [tab, setTab] = useState("audit");

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <p className="text-xs text-ink/45 mb-3">Admin</p>
      <h1 className="font-display text-3xl text-ink mb-2">Activity</h1>
      <p className="text-ink/60 mb-8">
        The audit trail behind every sensitive admin action and every email the app has sent.
      </p>

      <div className="flex gap-2 mb-8">
        {[
          { value: "audit", label: "Admin actions" },
          { value: "emails", label: "Emails sent" },
        ].map((t) => (
          <button
            key={t.value}
            type="button"
            onClick={() => setTab(t.value)}
            className={"rounded-md px-4 py-1.5 text-sm font-medium border " +
              (tab === t.value
                ? "border-pine bg-pine text-linen"
                : "border-mist text-ink/60 hover:text-ink")
            }
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "audit" ? <AuditLogTable /> : <EmailLogTable />}
    </div>
  );
}

function AuditLogTable() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminAuditLog()
      .then(setEntries)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-ink/50">Loading…</p>;
  if (entries.length === 0) return <p className="text-ink/50">No admin actions recorded yet.</p>;

  return (
    <div className="grid gap-2">
      {entries.map((e) => (
        <div key={e.id} className="rounded-xl border border-mist bg-white/60 px-5 py-3 flex items-center justify-between gap-4 text-sm">
          <div>
            <p className="text-ink">{e.action.replace(/_/g, " ")}</p>
            <p className="text-xs text-ink/45">
              {e.admin_name || "Unknown admin"}
              {e.subject_type && <> · {e.subject_type} #{e.subject_id}</>}
              {e.ip_address && <> · {e.ip_address}</>}
            </p>
          </div>
          <span className="shrink-0 text-xs text-ink/40">{new Date(e.created_at).toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
}

function EmailLogTable() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminEmailLog()
      .then(setEntries)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-ink/50">Loading…</p>;
  if (entries.length === 0) return <p className="text-ink/50">No emails logged yet.</p>;

  return (
    <div className="grid gap-2">
      {entries.map((e) => (
        <div key={e.id} className="rounded-xl border border-mist bg-white/60 px-5 py-3 flex items-center justify-between gap-4 text-sm">
          <div>
            <p className="text-ink">{e.subject || "(no subject)"}</p>
            <p className="text-xs text-ink/45">
              {e.to_email} · {e.category.replace(/_/g, " ")}
            </p>
          </div>
          <div className="text-right shrink-0">
            <p
              className={"text-xs " +
                (["suppressed", "failed"].includes(e.status) ? "text-clay" : "text-ink/50")
              }
            >
              {e.status}
            </p>
            <p className="text-xs text-ink/40">{new Date(e.created_at).toLocaleString()}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

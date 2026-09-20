import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchSupportTickets } from "../lib/api";

const STATUS_FILTERS = [
  { value: "open", label: "Open" },
  { value: "resolved", label: "Resolved" },
  { value: "all", label: "All" },
];

export default function SupportConsole() {
  const [status, setStatus] = useState("open");
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchSupportTickets(status)
      .then(setTickets)
      .finally(() => setLoading(false));
  }, [status]);

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <p className="text-xs text-ink/45 mb-3">
        Support console
      </p>
      <h1 className="font-display text-3xl text-ink mb-6">Tickets</h1>

      <div className="flex gap-2 mb-8">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => setStatus(f.value)}
            className={"rounded-md px-4 py-1.5 text-sm font-medium border " +
              (status === f.value
                ? "border-pine bg-pine text-linen"
                : "border-mist text-ink/60 hover:text-ink")
            }
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-ink/50">Loading…</p>
      ) : tickets.length === 0 ? (
        <p className="text-ink/50">No tickets here.</p>
      ) : (
        <div className="grid gap-3">
          {tickets.map((t) => (
            <Link
              key={t.id}
              to={`/support/console/${t.id}`}
              className="block rounded-xl border border-mist bg-white/60 px-5 py-4 hover:border-pine transition-colors"
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-display text-ink">{t.subject}</p>
                  <p className="text-xs text-ink/50">
                    {t.contact_name}
                    {t.booking_apartment_label && <> · {t.booking_apartment_label}</>}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs text-ink/50">
                    {t.status}
                  </p>
                  <p className="text-xs text-ink/40">{new Date(t.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

import { useEffect, useState } from "react";
import { adminTogglePaymentGateway, fetchAdminPaymentGateways } from "../../lib/api";

export default function AdminPaymentGateways() {
  const [gateways, setGateways] = useState([]);
  const [loading, setLoading] = useState(true);
  const [togglingId, setTogglingId] = useState(null);

  function load() {
    return fetchAdminPaymentGateways().then(setGateways);
  }

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, []);

  async function handleToggle(id) {
    setTogglingId(id);
    try {
      await adminTogglePaymentGateway(id);
      await load();
    } finally {
      setTogglingId(null);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <p className="text-xs text-ink/45 mb-3">
        Admin
      </p>
      <h1 className="font-display text-3xl text-ink mb-8">Payment gateways</h1>

      {loading ? (
        <p className="text-ink/50">Loading…</p>
      ) : (
        <div className="grid gap-3">
          {gateways.map((g) => (
            <div key={g.code} className="flex items-center justify-between rounded-xl border border-mist bg-white/60 px-5 py-4">
              <div>
                <p className="font-display text-ink">{g.display_name}</p>
                <p className="text-xs text-ink/40">
                  {g.is_healthy ? "Healthy" : "Unhealthy"} · {g.is_enabled_by_admin ? "Enabled" : "Disabled"}
                </p>
              </div>
              <button
                type="button"
                disabled={togglingId === g.id}
                onClick={() => handleToggle(g.id)}
                className={"text-xs border-b pb-0.5 disabled:opacity-50 " +
                  (g.is_enabled_by_admin ? "text-clay/80 border-clay/40" : "text-pine border-brass")
                }
              >
                {g.is_enabled_by_admin ? "Disable" : "Enable"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

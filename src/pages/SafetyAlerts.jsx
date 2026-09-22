import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Modal from "../components/Modal";
import { useToast } from "../context/ToastContext";
import { fetchSafetyAlerts, resolveSafetyAlert, suspendCleaner } from "../lib/api";

/**
 * Open safety escalations, for admins and support agents. Each alert can be
 * closed once someone has actually made contact, or escalated further by
 * suspending the cleaner on the spot.
 */
export default function SafetyAlerts() {
  const toast = useToast();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);
  const [suspendTarget, setSuspendTarget] = useState(null);
  const [suspendReason, setSuspendReason] = useState("");

  function load() {
    setLoading(true);
    setError("");
    return fetchSafetyAlerts()
      .then(setAlerts)
      .catch((err) => setError(err.message || "Could not load safety alerts."))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  async function handleResolve(alert) {
    setBusyId(alert.id);
    try {
      await resolveSafetyAlert(alert.id);
      await load();
      toast.success("Alert closed.");
    } catch (err) {
      toast.error(err.message || "Couldn't close this alert.");
    } finally {
      setBusyId(null);
    }
  }

  function startSuspend(alert) {
    setSuspendTarget(alert);
    setSuspendReason(`Missed safety check-in on booking #${alert.booking.id}.`);
  }

  async function confirmSuspend() {
    if (!suspendReason.trim()) return;
    setBusyId(suspendTarget.id);
    try {
      const res = await suspendCleaner(suspendTarget.cleaner.id, suspendReason.trim());
      await load();
      toast[res?.data?.active_jobs > 0 ? "warning" : "success"](res.message);
      setSuspendTarget(null);
    } catch (err) {
      toast.error(err.message || "Couldn't suspend this cleaner.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <p className="text-xs text-ink/45 mb-3">Operations</p>
      <h1 className="font-display text-3xl text-ink mb-2">Safety alerts</h1>
      <p className="text-ink/60 mb-8">
        A cleaner missed or failed a 30-minute safety check-in. Follow up immediately, then close
        the alert.{" "}
        <Link to="/staff/cleaners" className="text-pine border-b border-ink/30 pb-0.5">
          Manage cleaners →
        </Link>
      </p>

      {error && <p className="mb-4 text-sm text-clay">{error}</p>}

      {loading ? (
        <div className="grid gap-3">
          {[0, 1].map((i) => (
            <div key={i} className="h-40 animate-pulse rounded-xl border border-mist bg-white/40" />
          ))}
        </div>
      ) : alerts.length === 0 ? (
        <p className="text-ink/50">No open safety alerts.</p>
      ) : (
        <div className="grid gap-3">
          {alerts.map((a) => (
            <div
              key={a.id}
              className={"rounded-xl px-5 py-4 " +
                (a.is_critical
                  ? "border-2 border-clay bg-clay/[0.1]"
                  : "border border-clay/40 bg-clay/[0.06]")
              }
            >
              <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                <div>
                  <p className="font-display text-ink">
                    {a.booking.customer_name} · {a.booking.apartment_label}
                  </p>
                  {a.trigger_label && (
                    <p className={"mt-0.5 text-xs " + (a.is_critical ? "font-medium text-clay" : "text-ink/55")}>
                      {a.is_critical ? "URGENT — " : ""}{a.trigger_label}
                      {a.escalation_count > 1 && ` · alerted ${a.escalation_count} times, still open`}
                    </p>
                  )}
                </div>
                <span className="text-xs text-clay">Raised {new Date(a.due_at).toLocaleString()}</span>
              </div>
              <p className="text-sm text-ink/60 mb-3">{a.booking.service_address_text}</p>
              <div className="grid gap-1 text-sm">
                <p>
                  <span className="text-ink/45">Customer phone: </span>
                  <span className="text-ink">{a.booking.customer_phone || "—"}</span>
                </p>
                <p>
                  <span className="text-ink/45">Cleaner: </span>
                  <span className="text-ink">{a.cleaner?.full_legal_name || "Unassigned"}</span>
                  {a.cleaner && a.cleaner.status !== "active" && (
                    <span className="text-clay"> ({a.cleaner.status})</span>
                  )}
                </p>
                <p>
                  <span className="text-ink/45">Cleaner phone: </span>
                  <span className="text-ink">{a.cleaner?.phone || "—"}</span>
                </p>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-4 border-t border-clay/20 pt-3">
                <button
                  type="button"
                  disabled={busyId === a.id}
                  onClick={() => handleResolve(a)}
                  className="text-xs text-pine border-b border-ink/30 pb-0.5 disabled:opacity-50"
                >
                  {busyId === a.id ? "Closing…" : "Mark resolved"}
                </button>
                {a.cleaner?.status === "active" && (
                  <button
                    type="button"
                    disabled={busyId === a.id}
                    onClick={() => startSuspend(a)}
                    className="text-xs text-clay/80 border-b border-clay/40 pb-0.5 disabled:opacity-50"
                  >
                    Suspend cleaner
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={!!suspendTarget}
        onClose={() => setSuspendTarget(null)}
        title={suspendTarget?.cleaner ? `Suspend ${suspendTarget.cleaner.full_legal_name}?` : ""}
        description="They lose access straight away and stop being matched to jobs. This does not close the alert — do that once you have spoken to the customer."
        size="sm"
        footer={
          <>
            <button
              type="button"
              onClick={() => setSuspendTarget(null)}
              disabled={busyId === suspendTarget?.id}
              className="inline-flex items-center rounded-md border border-mist px-5 py-2.5 text-sm font-medium text-ink/60 transition-colors hover:border-ink/30 hover:text-ink disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={confirmSuspend}
              disabled={busyId === suspendTarget?.id || !suspendReason.trim()}
              className="inline-flex items-center rounded-md bg-clay px-5 py-2.5 text-sm font-medium text-linen transition-colors hover:bg-clay/90 disabled:opacity-60"
            >
              {busyId === suspendTarget?.id ? "Suspending…" : "Suspend"}
            </button>
          </>
        }
      >
        <label className="block">
          <span className="mb-2 block text-xs text-ink/45">Reason (required — goes to the audit log)</span>
          <textarea
            value={suspendReason}
            onChange={(e) => setSuspendReason(e.target.value)}
            rows={3}
            className="w-full resize-none rounded-xl border border-mist bg-white/80 px-4 py-3 text-sm text-ink placeholder:text-ink/30 focus:outline-none focus:border-pine"
          />
        </label>
      </Modal>
    </div>
  );
}

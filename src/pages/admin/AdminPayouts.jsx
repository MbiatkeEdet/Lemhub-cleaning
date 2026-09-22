import { useEffect, useState } from "react";
import { adminRecordPayout, fetchAdminPayouts } from "../../lib/api";
import { formatKobo } from "../../lib/money";

export default function AdminPayouts() {
  const [owed, setOwed] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [payingId, setPayingId] = useState(null);
  const [error, setError] = useState("");

  function load() {
    return fetchAdminPayouts().then((data) => {
      setOwed(data.owed);
      setHistory(data.history);
    });
  }

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, []);

  async function handlePayout(cleanerProfileId) {
    setPayingId(cleanerProfileId);
    setError("");
    try {
      await adminRecordPayout(cleanerProfileId);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setPayingId(null);
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <p className="text-xs text-ink/45 mb-3">Admin</p>
      <h1 className="font-display text-3xl text-ink mb-2">Cleaner payouts</h1>
      <p className="text-ink/60 mb-8">
        Tips owed to cleaners. Send the transfer yourself, then record it here.
      </p>

      {error && <p className="mb-4 text-sm text-clay">{error}</p>}

      {loading ? (
        <p className="text-ink/50">Loading…</p>
      ) : (
        <>
          <p className="text-xs text-ink/50 mb-4">
            Owed now
          </p>
          {owed.length === 0 ? (
            <p className="text-ink/50 mb-10">No unpaid tips right now.</p>
          ) : (
            <div className="grid gap-3 mb-10">
              {owed.map((row) => (
                <div
                  key={row.cleaner_profile_id}
                  className="rounded-xl border border-mist bg-white/60 px-5 py-4 flex flex-wrap items-center justify-between gap-3"
                >
                  <div>
                    <p className="font-display text-ink">{row.display_first_name}</p>
                    <p className="text-xs text-ink/50">
                      {row.payout_bank_name
                        ? `${row.payout_bank_name} · ${row.payout_account_name} · ${row.payout_account_number}`
                        : "No payout details on file yet"}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-mono text-sm text-ink">{formatKobo(row.unpaid_tips_kobo)}</span>
                    <button
                      type="button"
                      disabled={payingId === row.cleaner_profile_id}
                      onClick={() => handlePayout(row.cleaner_profile_id)}
                      className="text-xs text-pine border-b border-ink/30 pb-0.5 disabled:opacity-50"
                    >
                      {payingId === row.cleaner_profile_id ? "Recording…" : "Mark paid out"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <p className="text-xs text-ink/50 mb-4">
            Payout history
          </p>
          {history.length === 0 ? (
            <p className="text-ink/50">No payouts recorded yet.</p>
          ) : (
            <div className="grid gap-2">
              {history.map((p) => (
                <div
                  key={p.id}
                  className="rounded-xl border border-mist bg-white/40 px-5 py-3 flex items-center justify-between text-sm"
                >
                  <span className="text-ink">{p.cleaner_first_name}</span>
                  <span className="font-mono text-ink/60">{formatKobo(p.amount_kobo)}</span>
                  <span className="text-ink/45">{new Date(p.processed_at).toLocaleDateString()}</span>
                  <span className="text-ink/45">by {p.processed_by}</span>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

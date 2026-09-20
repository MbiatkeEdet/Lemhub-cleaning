import { useEffect, useState } from "react";
import { adminAnonymizeCustomer, fetchAdminCustomers } from "../../lib/api";
import { formatKobo } from "../../lib/money";

export default function AdminCustomers() {
  const [q, setQ] = useState("");
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actioningId, setActioningId] = useState(null);
  const [error, setError] = useState("");

  function load(query = q) {
    setLoading(true);
    return fetchAdminCustomers(query)
      .then(setCustomers)
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleSearch(e) {
    e.preventDefault();
    load(q);
  }

  async function handleAnonymize(customer) {
    const confirmed = window.confirm(
      `Erase personal data for "${customer.display_name}"? This redacts their name, email, and phone number and cannot be undone. Booking counts and lifetime spend are kept for reporting.`
    );
    if (!confirmed) return;

    setActioningId(customer.id);
    setError("");
    try {
      await adminAnonymizeCustomer(customer.id);
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
      <h1 className="font-display text-3xl text-ink mb-2">Customers</h1>
      <p className="text-ink/60 mb-8">
        Search by name, email, or phone. Use "Erase data" to fulfil a data-erasure request — see{" "}
        <code className="text-xs">docs/data-retention.md</code> for the policy this implements.
      </p>

      <form onSubmit={handleSearch} className="flex gap-3 mb-8">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search customers…"
          className="flex-1 rounded-xl border border-mist bg-white/70 px-4 py-3 text-sm text-ink placeholder:text-ink/30 focus:outline-none focus:border-pine"
        />
        <button
          type="submit"
          className="rounded-xl bg-pine px-6 py-3 text-xs text-linen"
        >
          Search
        </button>
      </form>

      {error && <p className="mb-4 text-sm text-clay">{error}</p>}

      {loading ? (
        <p className="text-ink/50">Loading…</p>
      ) : customers.length === 0 ? (
        <p className="text-ink/50">No customers found.</p>
      ) : (
        <div className="grid gap-3">
          {customers.map((c) => (
            <div key={c.id} className="rounded-xl border border-mist bg-white/60 px-5 py-4 flex items-center justify-between gap-4">
              <div>
                <p className="font-display text-ink">{c.display_name}</p>
                <p className="text-xs text-ink/50">
                  {c.normalized_email || "—"}
                  {c.normalized_phone && <> · {c.normalized_phone}</>}
                </p>
                <p className="text-xs text-ink/40 mt-1">
                  {c.total_bookings_count} bookings · {formatKobo(c.lifetime_spend_kobo)} lifetime
                </p>
              </div>
              {c.is_anonymized ? (
                <span className="text-xs text-ink/40">
                  Erased
                </span>
              ) : (
                <button
                  type="button"
                  disabled={actioningId === c.id}
                  onClick={() => handleAnonymize(c)}
                  className="shrink-0 text-xs text-clay/80 border-b border-clay/40 pb-0.5 disabled:opacity-50"
                >
                  {actioningId === c.id ? "Erasing…" : "Erase data"}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

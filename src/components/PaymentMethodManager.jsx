import { useEffect, useState } from "react";
import ConfirmDialog from "./ConfirmDialog";
import { useToast } from "../context/ToastContext";
import {
  addPaymentMethod,
  fetchAvailableGateways,
  fetchPaymentMethods,
  removePaymentMethod,
  setDefaultPaymentMethod,
} from "../lib/api";
import { formatKobo } from "../lib/money";

// Bank transfer can't be saved for later — only the card gateways hand back
// a reusable token.
const CARD_GATEWAYS = ["paystack", "flutterwave"];

export default function PaymentMethodManager() {
  const toast = useToast();
  const [methods, setMethods] = useState([]);
  const [gateways, setGateways] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(null);
  const [busyId, setBusyId] = useState(null);
  const [removeTarget, setRemoveTarget] = useState(null);

  useEffect(() => {
    Promise.all([fetchPaymentMethods(), fetchAvailableGateways()])
      .then(([savedMethods, availableGateways]) => {
        setMethods(savedMethods);
        setGateways(availableGateways.filter((g) => CARD_GATEWAYS.includes(g.code)));
      })
      .catch(() => toast.error("Couldn't load your saved cards."))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleAdd(code) {
    setAdding(code);
    try {
      const { redirect_url: redirectUrl, amount_kobo: amountKobo } = await addPaymentMethod(code);
      if (redirectUrl) {
        toast.info(`We'll charge ${formatKobo(amountKobo)} to confirm the card.`);
        window.location.href = redirectUrl;
        return;
      }
      toast.error("That provider didn't return a checkout page. Try the other one.");
    } catch (err) {
      toast.error(err.message || "Couldn't start adding a card.");
    } finally {
      setAdding(null);
    }
  }

  async function handleSetDefault(id) {
    setBusyId(id);
    try {
      setMethods(await setDefaultPaymentMethod(id));
      toast.success("Default card updated.");
    } catch (err) {
      toast.error(err.message || "Couldn't update your default card.");
    } finally {
      setBusyId(null);
    }
  }

  async function confirmRemove() {
    if (!removeTarget) return;
    setBusyId(removeTarget.id);
    try {
      setMethods(await removePaymentMethod(removeTarget.id));
      toast.success("Card removed.");
      setRemoveTarget(null);
    } catch (err) {
      toast.error(err.message || "Couldn't remove that card.");
    } finally {
      setBusyId(null);
    }
  }

  if (loading) {
    return <div className="h-24 animate-pulse rounded-2xl border border-mist bg-white/40" />;
  }

  return (
    <div className="rounded-xl border border-mist bg-white/60 p-6">
      {methods.length === 0 ? (
        <p className="text-sm text-ink/60">
          No card saved yet. Adding one lets us take care of repeat cleans without asking you to pay
          each time — and a plan with no card on file is paused until you add one.
        </p>
      ) : (
        <ul className="grid gap-3">
          {methods.map((m) => (
            <li
              key={m.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-mist bg-white px-4 py-3"
            >
              <div>
                <p className="text-sm text-ink">
                  {m.card_brand || "Card"} ending {m.last4}
                  {m.is_default ? (
                    <span className="ml-2 rounded-full bg-pine/10 px-2 py-0.5 text-xs text-pine">Default</span>
                  ) : null}
                </p>
                <p className="mt-0.5 text-xs text-ink/45">
                  {m.exp_month && m.exp_year ? `Expires ${String(m.exp_month).padStart(2, "0")}/${m.exp_year}` : "No expiry on file"}
                  {m.is_expired ? " · expired" : ""}
                </p>
              </div>
              <div className="flex items-center gap-4">
                {!m.is_default && (
                  <button
                    type="button"
                    disabled={busyId === m.id}
                    onClick={() => handleSetDefault(m.id)}
                    className="text-xs text-pine border-b border-brass pb-0.5 disabled:opacity-50"
                  >
                    Make default
                  </button>
                )}
                <button
                  type="button"
                  disabled={busyId === m.id}
                  onClick={() => setRemoveTarget(m)}
                  className="text-xs text-clay/80 border-b border-clay/40 pb-0.5 disabled:opacity-50"
                >
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {gateways.length === 0 ? (
        <p className="mt-5 text-xs text-ink/45">
          No card provider is available right now, so a card can't be added at the moment.
        </p>
      ) : (
        <div className="mt-5 flex flex-wrap items-center gap-3">
          {gateways.map((g) => (
            <button
              key={g.code}
              type="button"
              disabled={adding !== null}
              onClick={() => handleAdd(g.code)}
              className="rounded-md border border-mist px-4 py-2 text-sm text-ink/70 hover:border-pine hover:text-pine disabled:opacity-50"
            >
              {adding === g.code ? "Opening…" : `Add a card with ${g.display_name}`}
            </button>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={Boolean(removeTarget)}
        title="Remove this card?"
        description={
          methods.length > 1
            ? "Any recurring plan billed to it moves to your other card."
            : "This is your only card. Any recurring plan is paused until you add another, and we'll email you about it."
        }
        confirmLabel="Remove card"
        tone="danger"
        busy={busyId === removeTarget?.id}
        onConfirm={confirmRemove}
        onClose={() => setRemoveTarget(null)}
      />
    </div>
  );
}

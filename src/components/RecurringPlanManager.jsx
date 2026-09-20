import { useEffect, useState } from "react";
import PriceCalculator from "./PriceCalculator";
import SlotPicker from "./SlotPicker";
import { useCatalog } from "../hooks/useCatalog";
import {
  cancelRecurringPlan,
  createRecurringPlan,
  fetchPaymentMethods,
  fetchRecurringPlans,
  pauseRecurringPlan,
  resumeRecurringPlan,
} from "../lib/api";
import { formatKobo } from "../lib/money";
import { FALLBACK_SLOTS } from "../lib/slots";

const ACCESS_METHODS = [
  { value: "access_code", label: "There's an access code" },
  { value: "someone_present", label: "Someone will be home" },
  { value: "call_on_arrival", label: "Call me on arrival" },
  { value: "other", label: "Other" },
];

const STATUS_LABELS = {
  active: "Active",
  paused_payment_failed: "Paused — payment issue",
  paused_by_user: "Paused",
  cancelled: "Cancelled",
};

const emptyForm = { address: "", preferredTimeOfDay: "", preferredSlot: "11:00" };
const emptyAccess = { method: "someone_present", instructions: "", code: "" };

export default function RecurringPlanManager() {
  const { apartmentTypes, frequencies, slots } = useCatalog();
  const recurringFrequencies = frequencies.filter((f) => f.visits_per_month > 1);

  const [plans, setPlans] = useState([]);
  const [methods, setMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [apartmentCode, setApartmentCode] = useState("");
  const [frequencyCode, setFrequencyCode] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [access, setAccess] = useState(emptyAccess);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [actioningId, setActioningId] = useState(null);

  function loadAll() {
    setLoading(true);
    return Promise.all([fetchRecurringPlans(), fetchPaymentMethods()])
      .then(([plansRes, methodsRes]) => {
        setPlans(plansRes);
        setMethods(methodsRes);
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadAll();
  }, []);

  useEffect(() => {
    if (recurringFrequencies.length && !frequencyCode) {
      setFrequencyCode(recurringFrequencies[0].code);
    }
    if (apartmentTypes.length && !apartmentCode) {
      setApartmentCode(apartmentTypes[0].code);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apartmentTypes, recurringFrequencies]);

  const hasValidCard = methods.some((m) => !m.is_expired && m.status === "active");

  async function handleCreate(e) {
    e.preventDefault();
    if (!form.address.trim()) {
      setError("Add the apartment address.");
      return;
    }
    if (access.method === "access_code" && !access.code.trim()) {
      setError("Add the access code so your cleaner can get in.");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      await createRecurringPlan({
        apartment_type_code: apartmentCode,
        frequency_code: frequencyCode,
        service_address: form.address.trim(),
        preferred_time_of_day: form.preferredTimeOfDay.trim() || null,
        preferred_slot: form.preferredSlot || null,
        access: {
          method: access.method,
          instructions: access.instructions.trim() || null,
          code: access.method === "access_code" ? access.code.trim() : null,
        },
      });
      setShowForm(false);
      setForm(emptyForm);
      setAccess(emptyAccess);
      await loadAll();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleAction(planId, action) {
    setActioningId(planId);
    try {
      const fn = { pause: pauseRecurringPlan, resume: resumeRecurringPlan, cancel: cancelRecurringPlan }[action];
      await fn(planId);
      await loadAll();
    } catch (err) {
      setError(err.message);
    } finally {
      setActioningId(null);
    }
  }

  if (loading) {
    return <p className="text-ink/50">Loading recurring cleaning…</p>;
  }

  return (
    <div>
      {methods.length > 0 && (
        <div className="mb-8">
          <p className="text-xs text-ink/50 mb-3">
            Card on file
          </p>
          <div className="grid gap-2">
            {methods.map((m) => (
              <div
                key={m.id}
                className="flex items-center justify-between rounded-xl border border-mist bg-white/60 px-4 py-3 text-sm"
              >
                <span className="text-ink capitalize">
                  {m.card_brand} •••• {m.last4}
                </span>
                <span className={m.is_expired ? "text-clay" : "text-ink/50"}>
                  {m.is_expired ? "Expired" : `Exp ${m.exp_month}/${m.exp_year}`}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {plans.length > 0 && (
        <div className="grid gap-4 mb-8">
          {plans.map((plan) => (
            <div key={plan.id} className="rounded-2xl border border-mist bg-white/60 p-5">
              <div className="flex items-center justify-between mb-2">
                <p className="font-display text-ink">
                  {plan.apartment_label} · {plan.frequency_label}
                </p>
                <span
                  className={"text-xs " +
                    (plan.status === "active" ? "text-pine" : plan.status === "paused_payment_failed" ? "text-clay" : "text-ink/40")
                  }
                >
                  {STATUS_LABELS[plan.status] || plan.status}
                </span>
              </div>
              <p className="text-xs text-ink/50 mb-1">{plan.service_address_text}</p>
              <p className="text-xs text-ink/50 mb-3">
                {formatKobo(plan.per_visit_price_kobo)} / visit · next billing {plan.next_billing_date}
                {plan.preferred_slot_window ? ` · arrives ${plan.preferred_slot_window}` : ""}
              </p>

              {plan.status === "paused_payment_failed" && (
                <div className="mb-3 rounded-lg border border-clay/30 bg-clay/[0.06] px-3 py-2 text-xs text-clay">
                  {plan.paused_reason || "We couldn't charge your card."} Update your card by making a
                  one-time booking, then resume below.
                </div>
              )}

              <div className="flex gap-3">
                {plan.status === "active" && (
                  <ActionButton onClick={() => handleAction(plan.id, "pause")} busy={actioningId === plan.id}>
                    Pause
                  </ActionButton>
                )}
                {(plan.status === "paused_by_user" || plan.status === "paused_payment_failed") && (
                  <ActionButton onClick={() => handleAction(plan.id, "resume")} busy={actioningId === plan.id}>
                    Resume
                  </ActionButton>
                )}
                {plan.status !== "cancelled" && (
                  <ActionButton onClick={() => handleAction(plan.id, "cancel")} busy={actioningId === plan.id} tone="clay">
                    Cancel
                  </ActionButton>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {!showForm && (
        <button
          type="button"
          onClick={() => (hasValidCard ? setShowForm(true) : setError("no-card"))}
          className="inline-flex items-center rounded-md bg-pine px-6 py-3 text-sm font-medium text-linen hover:bg-pine-light transition-colors"
        >
          Set up recurring cleaning
        </button>
      )}

      {error === "no-card" && (
        <p className="mt-4 text-sm text-ink/60">
          You need a saved card to set up recurring cleaning.{" "}
          <a href="/book" className="text-pine border-b border-ink/30 pb-0.5">
            Book a one-time clean →
          </a>{" "}
          and it'll be saved automatically after payment.
        </p>
      )}

      {showForm && (
        <form onSubmit={handleCreate} className="rounded-2xl border border-mist bg-white/60 p-6">
          <PriceCalculator
            apartmentTypes={apartmentTypes}
            frequencies={recurringFrequencies}
            apartmentCode={apartmentCode}
            frequencyCode={frequencyCode}
            onChangeApartment={setApartmentCode}
            onChangeFrequency={setFrequencyCode}
          />

          <div className="grid gap-4 mt-8">
            <Field
              label="Apartment address"
              value={form.address}
              onChange={(v) => setForm({ ...form, address: v })}
              placeholder="12 Aba Road, Port Harcourt"
            />
            <Field
              label="Anything else about timing (optional)"
              value={form.preferredTimeOfDay}
              onChange={(v) => setForm({ ...form, preferredTimeOfDay: v })}
              placeholder="e.g. not the first week of the month"
            />
          </div>

          <p className="text-xs text-ink/50 mt-8 mb-4">
            Which arrival window should every visit use?
          </p>
          <SlotPicker
            slots={slots?.length ? slots : FALLBACK_SLOTS}
            value={form.preferredSlot}
            columns={2}
            onChange={(v) => setForm({ ...form, preferredSlot: v })}
          />

          <p className="text-xs text-ink/50 mt-8 mb-4">
            How does your cleaner get in?
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {ACCESS_METHODS.map((m) => {
              const activeMethod = access.method === m.value;
              return (
                <button
                  type="button"
                  key={m.value}
                  onClick={() => setAccess({ ...access, method: m.value })}
                  className={"rounded-xl border p-3 text-left text-sm transition-colors " +
                    (activeMethod
                      ? "border-pine bg-pine text-linen"
                      : "border-mist bg-white/60 text-ink hover:border-sage")
                  }
                >
                  {m.label}
                </button>
              );
            })}
          </div>
          {access.method === "access_code" && (
            <div className="mt-4">
              <Field
                label="Access code"
                value={access.code}
                onChange={(v) => setAccess({ ...access, code: v })}
                placeholder="e.g. gate code, lockbox code"
              />
            </div>
          )}

          {error && error !== "no-card" && <p className="mt-4 text-sm text-clay">{error}</p>}

          <div className="mt-6 flex gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center rounded-md bg-pine px-6 py-3 text-sm font-medium text-linen disabled:opacity-60"
            >
              {submitting ? "Setting up…" : "Confirm recurring plan"}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="text-xs text-ink/50"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

function ActionButton({ onClick, busy, children, tone = "pine" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy}
      className={"text-xs border-b pb-0.5 disabled:opacity-50 " +
        (tone === "clay" ? "text-clay/80 border-clay/40" : "text-pine border-brass")
      }
    >
      {children}
    </button>
  );
}

function Field({ label, value, onChange, placeholder }) {
  return (
    <label className="block">
      <span className="text-xs text-ink/45 mb-2 block">
        {label}
      </span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-mist bg-white/70 px-4 py-3 text-sm text-ink placeholder:text-ink/30 focus:outline-none focus:border-pine"
      />
    </label>
  );
}

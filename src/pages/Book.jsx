import { useState } from "react";
import PriceCalculator from "../components/PriceCalculator";
import SealBadge from "../components/SealBadge";
import { useApp } from "../context/AppContext";
import { calculatePrice, currency } from "../data/pricing";

const emptyForm = { name: "", phone: "", address: "" };

export default function Book() {
  const { addBooking } = useApp();
  const [apartmentId, setApartmentId] = useState("1bed");
  const [frequencyId, setFrequencyId] = useState("biweekly");
  const [form, setForm] = useState(emptyForm);
  const [confirmed, setConfirmed] = useState(null);
  const [error, setError] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim() || !form.address.trim()) {
      setError("Please fill in your name, phone number, and address.");
      return;
    }
    setError("");
    const price = calculatePrice(apartmentId, frequencyId);
    const booking = addBooking({
      client: form,
      apartmentId,
      frequencyId,
      apartmentLabel: price.apartment.label,
      frequencyLabel: price.frequency.label,
      perVisit: price.perVisit,
      monthlyTotal: price.monthlyTotal,
    });
    setConfirmed(booking);
  }

  if (confirmed) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-24 text-center">
        <div className="flex justify-center mb-8">
          <SealBadge size={96} />
        </div>
        <h1 className="font-display text-3xl text-ink mb-3">
          Request received, {confirmed.client.name.split(" ")[0]}.
        </h1>
        <p className="text-ink/60 leading-relaxed mb-8">
          We'll match you with a verified cleaner for your{" "}
          {confirmed.apartmentLabel.toLowerCase()} and confirm your{" "}
          {confirmed.frequencyLabel.toLowerCase()} schedule within a few
          hours.
        </p>
        <div className="rounded-2xl border border-mist bg-white/60 p-6 text-left grid gap-3 mb-8">
          <Row label="Apartment" value={confirmed.apartmentLabel} />
          <Row label="Frequency" value={confirmed.frequencyLabel} />
          <Row label="Per visit" value={currency(confirmed.perVisit)} />
          <Row label="Monthly total" value={currency(confirmed.monthlyTotal)} />
          <Row label="Status" value={confirmed.status} />
        </div>
        <button
          onClick={() => {
            setConfirmed(null);
            setForm(emptyForm);
          }}
          className="font-mono text-xs uppercase tracking-[0.14em] text-pine border-b border-brass pb-1"
        >
          Book another apartment →
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-20">
      <p className="font-mono text-xs uppercase tracking-[0.14em] text-ink/45 mb-3">
        Book a clean
      </p>
      <h1 className="font-display text-4xl text-ink mb-4">
        Set up your cleaning plan.
      </h1>
      <p className="text-ink/60 leading-relaxed mb-12 max-w-lg">
        Choose your apartment size and how often you'd like a verified
        cleaner to visit. Your price updates as you go.
      </p>

      <PriceCalculator
        apartmentId={apartmentId}
        frequencyId={frequencyId}
        onChangeApartment={setApartmentId}
        onChangeFrequency={setFrequencyId}
      />

      <form onSubmit={handleSubmit} className="mt-12 border-t border-mist pt-10">
        <p className="font-mono text-xs uppercase tracking-[0.14em] text-ink/50 mb-6">
          03 · Your details
        </p>
        <div className="grid gap-5">
          <Field
            label="Full name"
            value={form.name}
            onChange={(v) => setForm({ ...form, name: v })}
            placeholder="Chioma Eze"
          />
          <Field
            label="Phone number"
            value={form.phone}
            onChange={(v) => setForm({ ...form, phone: v })}
            placeholder="080 1234 5678"
          />
          <Field
            label="Apartment address"
            value={form.address}
            onChange={(v) => setForm({ ...form, address: v })}
            placeholder="12 Aba Road, Port Harcourt"
          />
        </div>

        {error && (
          <p className="mt-4 text-sm text-clay">{error}</p>
        )}

        <button
          type="submit"
          className="mt-8 inline-flex items-center rounded-full bg-pine px-8 py-3.5 font-mono text-xs uppercase tracking-[0.14em] text-linen hover:bg-pine-light transition-colors"
        >
          Confirm request
        </button>
      </form>
    </div>
  );
}

function Field({ label, value, onChange, placeholder }) {
  return (
    <label className="block">
      <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-ink/45 mb-2 block">
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

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between">
      <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-ink/45">
        {label}
      </span>
      <span className="font-display text-ink">{value}</span>
    </div>
  );
}

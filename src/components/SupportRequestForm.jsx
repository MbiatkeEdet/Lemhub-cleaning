import { useState } from "react";
import { submitSupportTicket } from "../lib/api";
import PhoneField from "./PhoneField";
import RequiredMark, { RequiredLegend } from "./RequiredMark";

export default function SupportRequestForm({
  bookingId,
  defaultName = "",
  defaultEmail = "",
  defaultMessage = "",
  subject = null,
  submitLabel = "Send message",
  sentMessage = "Thanks — we've received your message and will get back to you shortly.",
  onSent,
}) {
  const [form, setForm] = useState({
    name: defaultName,
    email: defaultEmail,
    phone: "",
    message: defaultMessage,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim() || !form.message.trim()) {
      setError("Please fill in your name and message.");
      return;
    }
    if (!form.email.trim() && !form.phone.trim()) {
      setError("Add an email or phone number so we can reply.");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      await submitSupportTicket({
        name: form.name.trim(),
        email: form.email.trim() || null,
        phone: form.phone.trim() || null,
        subject: subject || undefined,
        message: form.message.trim(),
        booking_id: bookingId || null,
      });
      setSent(true);
      onSent?.();
    } catch (err) {
      const message = err.errors ? Object.values(err.errors).flat().join(" ") : err.message;
      setError(message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (sent) {
    return (
      <div className="rounded-2xl border border-sage-dim bg-sage/10 p-6 text-center text-sm text-pine">
        {sentMessage}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <RequiredLegend />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Full name" required value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
        <PhoneField
          label="Phone (optional)"
          value={form.phone}
          onChange={(v) => setForm({ ...form, phone: v })}
          required={false}
        />
      </div>
      <Field
        label="Email (or a phone number above)"
        type="email"
        value={form.email}
        onChange={(v) => setForm({ ...form, email: v })}
        placeholder="you@example.com"
      />
      <label className="block">
        <span className="mb-2 block text-xs text-ink/45">
          Message
          <RequiredMark />
        </span>
        <textarea
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          rows={5}
          className="w-full rounded-xl border border-mist bg-white/70 px-4 py-3 text-sm text-ink placeholder:text-ink/30 focus:outline-none focus:border-pine resize-none"
        />
      </label>

      {error && <p className="text-sm text-clay">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="inline-flex items-center justify-center rounded-md bg-pine px-6 py-3 text-sm font-medium text-linen disabled:opacity-60"
      >
        {submitting ? "Sending…" : submitLabel}
      </button>
    </form>
  );
}

function Field({ label, value, onChange, placeholder, type = "text", required = false }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs text-ink/45">
        {label}
        {required && <RequiredMark />}
      </span>
      <input
        type={type}
        value={value}
        required={required}
        aria-required={required || undefined}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-mist bg-white/70 px-4 py-3 text-sm text-ink placeholder:text-ink/30 focus:outline-none focus:border-pine"
      />
    </label>
  );
}

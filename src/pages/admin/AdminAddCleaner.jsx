import { useState } from "react";
import { adminBatchImportCleaners, adminCreateCleaner } from "../../lib/api";
import PhoneField from "../../components/PhoneField";

const emptyForm = { full_legal_name: "", email: "", phone: "", years_experience: "", bio: "" };

export default function AdminAddCleaner() {
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const [importing, setImporting] = useState(false);

  async function handleCreate(e) {
    e.preventDefault();
    setError("");
    setMessage("");
    setSubmitting(true);
    try {
      const profile = await adminCreateCleaner({
        full_legal_name: form.full_legal_name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || null,
        years_experience: form.years_experience ? Number(form.years_experience) : null,
        bio: form.bio.trim() || null,
      });
      setMessage(`${profile.display_first_name} added and approved.`);
      setForm(emptyForm);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleImport(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    setImportResult(null);
    try {
      const result = await adminBatchImportCleaners(file);
      setImportResult(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setImporting(false);
      e.target.value = "";
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <p className="text-xs text-ink/45 mb-3">
        Admin
      </p>
      <h1 className="font-display text-3xl text-ink mb-8">Add a cleaner</h1>

      <div className="rounded-2xl border border-mist bg-white/60 p-6 mb-10">
        <p className="text-xs text-ink/50 mb-5">
          Manual entry
        </p>
        <form onSubmit={handleCreate} className="grid gap-4">
          <Field label="Full legal name" value={form.full_legal_name} onChange={(v) => setForm({ ...form, full_legal_name: v })} />
          <Field label="Email" type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} />
          <PhoneField label="Phone" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} />
          <Field label="Years of experience" type="number" value={form.years_experience} onChange={(v) => setForm({ ...form, years_experience: v })} />
          <Field label="Bio" value={form.bio} onChange={(v) => setForm({ ...form, bio: v })} />

          {error && <p className="text-sm text-clay">{error}</p>}
          {message && <p className="text-sm text-pine">{message}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="inline-flex w-fit items-center rounded-md bg-pine px-6 py-3 text-sm font-medium text-linen disabled:opacity-60"
          >
            {submitting ? "Adding…" : "Add & approve"}
          </button>
        </form>
      </div>

      <div className="rounded-2xl border border-mist bg-white/60 p-6">
        <p className="text-xs text-ink/50 mb-3">
          Batch import (CSV)
        </p>
        <p className="text-xs text-ink/50 mb-4">
          Columns: full_legal_name, email, phone, years_experience
        </p>
        <input type="file" accept=".csv" onChange={handleImport} disabled={importing} className="text-sm text-ink" />

        {importResult && (
          <div className="mt-5 text-sm">
            <p className="text-pine mb-2">{importResult.created.length} cleaner(s) created.</p>
            {importResult.errors.length > 0 && (
              <div className="text-clay">
                <p className="mb-1">{importResult.errors.length} row(s) skipped:</p>
                <ul className="list-disc list-inside">
                  {importResult.errors.map((e, i) => (
                    <li key={i}>Row {e.row}: {e.reason}{e.email ? ` (${e.email})` : ""}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function Field({ label, value, onChange, type = "text" }) {
  return (
    <label className="block">
      <span className="text-xs text-ink/45 mb-2 block">
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-mist bg-white/70 px-4 py-3 text-sm text-ink placeholder:text-ink/30 focus:outline-none focus:border-pine"
      />
    </label>
  );
}

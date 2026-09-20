import { useState } from "react";
import { saveCleanerApplication, submitCleanerApplication, uploadCleanerDocument } from "../lib/api";
import PhoneField from "./PhoneField";

const DOCUMENT_LABELS = {
  proof_of_address: "Proof of address (recent utility bill)",
  bank_statement: "Recent bank statement",
  guarantor_letter: "Signed guarantor's letter",
  guarantor_id: "Guarantor's ID",
  passport_photo: "Passport-style photograph (headshot)",
};

const DOCUMENT_ORDER = Object.keys(DOCUMENT_LABELS);

export default function CleanerApplicationForm({ application, onChanged }) {
  const [personal, setPersonal] = useState({
    full_legal_name: application?.full_legal_name || "",
    phone: application?.phone || "",
  });
  const [guarantor, setGuarantor] = useState({
    full_name: application?.guarantor?.full_name || "",
    relationship: application?.guarantor?.relationship || "",
    phone: application?.guarantor?.phone || "",
    email: application?.guarantor?.email || "",
    address: application?.guarantor?.address || "",
  });
  const [hasApplication, setHasApplication] = useState(Boolean(application));
  const [checklist, setChecklist] = useState(application?.document_checklist || {});
  const [uploadingType, setUploadingType] = useState(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const allDocumentsUploaded = DOCUMENT_ORDER.every((type) => checklist[type]);

  async function handleSaveDetails(e) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      await saveCleanerApplication({
        full_legal_name: personal.full_legal_name.trim(),
        phone: personal.phone.trim(),
        guarantor: {
          full_name: guarantor.full_name.trim(),
          relationship: guarantor.relationship.trim(),
          phone: guarantor.phone.trim(),
          email: guarantor.email.trim() || null,
          address: guarantor.address.trim(),
        },
      });
      setHasApplication(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleUpload(type, file) {
    if (!file) return;
    setError("");
    setUploadingType(type);
    try {
      await uploadCleanerDocument(type, file);
      setChecklist((prev) => ({ ...prev, [type]: true }));
    } catch (err) {
      setError(err.message);
    } finally {
      setUploadingType(null);
    }
  }

  async function handleSubmit() {
    setError("");
    setSubmitting(true);
    try {
      const updated = await submitCleanerApplication();
      onChanged(updated);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="grid gap-8">
      <form onSubmit={handleSaveDetails} className="rounded-2xl border border-mist bg-white/60 p-6">
        <p className="text-xs text-ink/50 mb-5">
          01 · Your details
        </p>
        <div className="grid gap-4">
          <Field
            label="Full legal name"
            value={personal.full_legal_name}
            onChange={(v) => setPersonal({ ...personal, full_legal_name: v })}
            placeholder="As it appears on your bank account"
          />
          <PhoneField
            label="Phone number"
            value={personal.phone}
            onChange={(v) => setPersonal({ ...personal, phone: v })}
          />
        </div>

        <p className="text-xs text-ink/50 mt-8 mb-5">
          02 · Your guarantor
        </p>
        <div className="grid gap-4">
          <Field
            label="Guarantor's full name"
            value={guarantor.full_name}
            onChange={(v) => setGuarantor({ ...guarantor, full_name: v })}
          />
          <Field
            label="Relationship to you"
            value={guarantor.relationship}
            onChange={(v) => setGuarantor({ ...guarantor, relationship: v })}
            placeholder="e.g. Brother, Pastor, Former employer"
          />
          <PhoneField
            label="Guarantor's phone"
            value={guarantor.phone}
            onChange={(v) => setGuarantor({ ...guarantor, phone: v })}
          />
          <Field
            label="Guarantor's email (optional)"
            value={guarantor.email}
            onChange={(v) => setGuarantor({ ...guarantor, email: v })}
            type="email"
          />
          <Field
            label="Guarantor's address"
            value={guarantor.address}
            onChange={(v) => setGuarantor({ ...guarantor, address: v })}
          />
        </div>

        {error && <p className="mt-4 text-sm text-clay">{error}</p>}

        <button
          type="submit"
          disabled={saving}
          className="mt-6 inline-flex items-center rounded-md bg-pine px-6 py-3 text-sm font-medium text-linen disabled:opacity-60"
        >
          {saving ? "Saving…" : hasApplication ? "Save changes" : "Save & continue"}
        </button>
      </form>

      {hasApplication && (
        <div className="rounded-2xl border border-mist bg-white/60 p-6">
          <p className="text-xs text-ink/50 mb-5">
            03 · Upload your documents
          </p>
          <div className="grid gap-3">
            {DOCUMENT_ORDER.map((type) => (
              <div
                key={type}
                className="flex items-center justify-between gap-4 rounded-xl border border-mist bg-white/70 px-4 py-3"
              >
                <div>
                  <p className="text-sm text-ink">{DOCUMENT_LABELS[type]}</p>
                  <p className="text-xs text-ink/40">
                    {checklist[type] ? "Uploaded ✓" : "Not uploaded"}
                  </p>
                </div>
                <label className="shrink-0 cursor-pointer text-xs text-pine border-b border-ink/30 pb-0.5">
                  {uploadingType === type ? "Uploading…" : checklist[type] ? "Replace" : "Upload"}
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    className="hidden"
                    disabled={uploadingType !== null}
                    onChange={(e) => handleUpload(type, e.target.files?.[0])}
                  />
                </label>
              </div>
            ))}
          </div>

          {error && <p className="mt-4 text-sm text-clay">{error}</p>}

          <button
            type="button"
            onClick={handleSubmit}
            disabled={!allDocumentsUploaded || submitting}
            className="mt-6 inline-flex items-center rounded-md bg-pine px-6 py-3 text-sm font-medium text-linen disabled:opacity-40"
          >
            {submitting ? "Submitting…" : "Submit for review"}
          </button>
        </div>
      )}
    </div>
  );
}

function Field({ label, value, onChange, placeholder, type = "text" }) {
  return (
    <label className="block">
      <span className="text-xs text-ink/45 mb-2 block">
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-mist bg-white/70 px-4 py-3 text-sm text-ink placeholder:text-ink/30 focus:outline-none focus:border-pine"
      />
    </label>
  );
}

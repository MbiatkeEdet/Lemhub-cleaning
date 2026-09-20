import { useEffect, useState } from "react";
import { adminUpdateSettings, fetchAdminSettings } from "../../lib/api";

export default function AdminSettings() {
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetchAdminSettings()
      .then((data) => setWhatsappNumber(data.whatsapp_number || ""))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSaved(false);
    setSaving(true);
    try {
      const data = await adminUpdateSettings({ whatsapp_number: whatsappNumber.trim() });
      setWhatsappNumber(data.whatsapp_number || "");
      setSaved(true);
    } catch (err) {
      setError(err.errors?.whatsapp_number?.[0] || err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <p className="text-xs text-ink/45 mb-3">Admin</p>
      <h1 className="font-display text-3xl text-ink mb-8">Settings</h1>

      {loading ? (
        <p className="text-ink/50">Loading…</p>
      ) : (
        <form onSubmit={handleSubmit} className="rounded-2xl border border-mist bg-white/60 p-6">
          <label className="block text-xs text-ink/50 mb-2" htmlFor="whatsapp_number">
            WhatsApp number
          </label>
          <input
            id="whatsapp_number"
            value={whatsappNumber}
            onChange={(e) => setWhatsappNumber(e.target.value)}
            placeholder="+2348159682481"
            className="w-full rounded-lg border border-mist bg-white px-4 py-2.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-pine/30"
          />
          <p className="mt-2 text-xs text-ink/45">
            Full international format. This is the number behind the chat bubble and the one shown
            on the contact page, so it has to be a live WhatsApp account.
          </p>

          {error ? <p className="mt-4 text-sm text-clay">{error}</p> : null}
          {saved ? <p className="mt-4 text-sm text-pine">Saved.</p> : null}

          <button
            type="submit"
            disabled={saving}
            className="mt-6 rounded-md bg-pine px-5 py-2 text-sm font-medium text-white hover:bg-pine/90 disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save"}
          </button>
        </form>
      )}
    </div>
  );
}

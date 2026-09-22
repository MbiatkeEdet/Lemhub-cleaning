import { useEffect, useState } from "react";
import Modal from "../../components/Modal";
import {
  adminCreateApartmentType,
  adminCreateFrequency,
  adminUpdateApartmentType,
  adminUpdateFrequency,
  fetchAdminApartmentTypes,
  fetchAdminFrequencies,
} from "../../lib/api";
import { formatKobo } from "../../lib/money";

export default function AdminPricing() {
  const [apartmentTypes, setApartmentTypes] = useState([]);
  const [frequencies, setFrequencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);

  function load() {
    return Promise.all([fetchAdminApartmentTypes(), fetchAdminFrequencies()]).then(
      ([types, freqs]) => {
        setApartmentTypes(types);
        setFrequencies(freqs);
      }
    );
  }

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <p className="text-xs text-ink/45 mb-3">Admin</p>
      <h1 className="font-display text-3xl text-ink mb-2">Pricing</h1>
      <p className="text-sm text-ink/50 mb-8">
        What customers see and pay for on the booking page.
      </p>

      {loading ? (
        <p className="text-ink/50">Loading…</p>
      ) : (
        <div className="grid gap-10">
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-xl text-ink">Apartment sizes</h2>
              <button
                type="button"
                onClick={() =>
                  setEditing({ kind: "apartment", item: null, nextSortOrder: apartmentTypes.length })
                }
                className="text-xs text-pine border-b border-ink/30 pb-0.5"
              >
                + Add size
              </button>
            </div>
            <div className="grid gap-3">
              {apartmentTypes.map((t) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between gap-4 rounded-xl border border-mist bg-white/60 px-5 py-4"
                >
                  <div>
                    <p className="font-display text-ink">
                      {t.label}
                      {!t.active && (
                        <span className="ml-2 text-xs text-clay">
                          Inactive
                        </span>
                      )}
                      {t.is_custom_pricing && (
                        <span className="ml-2 text-xs text-ink/50">
                          Custom pricing
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-ink/40">
                      {t.subtitle}
                    </p>
                  </div>
                  <div className="flex items-center gap-5 shrink-0">
                    <p className="font-display text-ink">
                      {t.is_custom_pricing ? "Contact us" : formatKobo(t.base_price_kobo)}
                    </p>
                    <button
                      type="button"
                      onClick={() => setEditing({ kind: "apartment", item: t })}
                      className="text-xs text-pine border-b border-ink/30 pb-0.5"
                    >
                      Edit
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-xl text-ink">Cleaning frequencies</h2>
              <button
                type="button"
                onClick={() =>
                  setEditing({ kind: "frequency", item: null, nextSortOrder: frequencies.length })
                }
                className="text-xs text-pine border-b border-ink/30 pb-0.5"
              >
                + Add frequency
              </button>
            </div>
            <div className="grid gap-3">
              {frequencies.map((f) => (
                <div
                  key={f.id}
                  className="flex items-center justify-between gap-4 rounded-xl border border-mist bg-white/60 px-5 py-4"
                >
                  <div>
                    <p className="font-display text-ink">
                      {f.label}
                      {!f.active && (
                        <span className="ml-2 text-xs text-clay">
                          Inactive
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-ink/40">
                      {f.detail}
                    </p>
                  </div>
                  <div className="flex items-center gap-5 shrink-0">
                    <p className="font-display text-ink">
                      {f.multiplier}× · {f.visits_per_month}/mo
                    </p>
                    <button
                      type="button"
                      onClick={() => setEditing({ kind: "frequency", item: f })}
                      className="text-xs text-pine border-b border-ink/30 pb-0.5"
                    >
                      Edit
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}

      <EditModal
        editing={editing}
        onClose={() => setEditing(null)}
        onSaved={() => {
          setEditing(null);
          load();
        }}
      />
    </div>
  );
}

function EditModal({ editing, onClose, onSaved }) {
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const isCreate = !!editing && !editing.item;

  useEffect(() => {
    if (!editing) return;
    setError("");
    if (editing.kind === "apartment") {
      const t = editing.item;
      setForm(
        t
          ? {
              code: t.code,
              label: t.label,
              subtitle: t.subtitle || "",
              is_custom_pricing: !!t.is_custom_pricing,
              priceNaira: t.base_price_kobo != null ? String(t.base_price_kobo / 100) : "",
              sort_order: String(t.sort_order),
              active: t.active,
            }
          : {
              code: "",
              label: "",
              subtitle: "",
              is_custom_pricing: false,
              priceNaira: "",
              sort_order: String(editing.nextSortOrder ?? 0),
              active: true,
            }
      );
    } else {
      const f = editing.item;
      setForm(
        f
          ? {
              code: f.code,
              label: f.label,
              detail: f.detail || "",
              visits_per_month: String(f.visits_per_month),
              multiplier: String(f.multiplier),
              sort_order: String(f.sort_order),
              active: f.active,
            }
          : {
              code: "",
              label: "",
              detail: "",
              visits_per_month: "",
              multiplier: "1",
              sort_order: String(editing.nextSortOrder ?? 0),
              active: true,
            }
      );
    }
  }, [editing]);

  if (!editing || !form) return null;

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const code = form.code.trim();
      if (!code) {
        throw new Error("Enter a code.");
      }

      if (editing.kind === "apartment") {
        let basePriceKobo = null;
        if (!form.is_custom_pricing) {
          const priceNaira = Number(form.priceNaira);
          if (!Number.isFinite(priceNaira) || priceNaira < 0) {
            throw new Error("Enter a valid price.");
          }
          basePriceKobo = Math.round(priceNaira * 100);
        }
        const payload = {
          code,
          label: form.label.trim(),
          subtitle: form.subtitle.trim() || null,
          is_custom_pricing: form.is_custom_pricing,
          base_price_kobo: basePriceKobo,
          sort_order: Number(form.sort_order) || 0,
          active: form.active,
        };
        if (isCreate) {
          await adminCreateApartmentType(payload);
        } else {
          await adminUpdateApartmentType(editing.item.id, payload);
        }
      } else {
        const payload = {
          code,
          label: form.label.trim(),
          detail: form.detail.trim() || null,
          visits_per_month: Number(form.visits_per_month),
          multiplier: Number(form.multiplier),
          sort_order: Number(form.sort_order) || 0,
          active: form.active,
        };
        if (isCreate) {
          await adminCreateFrequency(payload);
        } else {
          await adminUpdateFrequency(editing.item.id, payload);
        }
      }
      onSaved();
    } catch (err) {
      setError(err.errors ? Object.values(err.errors).flat().join(" ") : err.message || "Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      open={!!editing}
      onClose={onClose}
      title={
        isCreate
          ? editing.kind === "apartment"
            ? "Add apartment size"
            : "Add frequency"
          : editing.kind === "apartment"
            ? "Edit apartment size"
            : "Edit frequency"
      }
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-mist px-5 py-2.5 text-sm font-medium text-ink/60 hover:border-ink/30"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="pricing-edit-form"
            disabled={saving}
            className="rounded-md bg-pine px-6 py-2.5 text-sm font-medium text-linen hover:bg-pine-light disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save"}
          </button>
        </>
      }
    >
      <form id="pricing-edit-form" onSubmit={handleSave} className="grid gap-4">
        {error && (
          <p className="rounded-xl border border-clay/20 bg-clay/[0.05] px-4 py-2.5 text-sm text-clay">
            {error}
          </p>
        )}

        {isCreate && (
          <ModalField
            label="Code (unique, no spaces)"
            value={form.code}
            onChange={(v) => setForm({ ...form, code: v })}
          />
        )}

        <ModalField label="Label" value={form.label} onChange={(v) => setForm({ ...form, label: v })} />

        {editing.kind === "apartment" ? (
          <>
            <ModalField
              label="Subtitle"
              value={form.subtitle}
              onChange={(v) => setForm({ ...form, subtitle: v })}
            />

            <label className="flex items-center gap-2 text-sm text-ink/70">
              <input
                type="checkbox"
                checked={form.is_custom_pricing}
                onChange={(e) => setForm({ ...form, is_custom_pricing: e.target.checked })}
                className="rounded border-mist"
              />
              Custom pricing (customer requests a quote instead of a fixed price)
            </label>

            {!form.is_custom_pricing && (
              <ModalField
                label="Price per visit (₦)"
                type="number"
                value={form.priceNaira}
                onChange={(v) => setForm({ ...form, priceNaira: v })}
              />
            )}
          </>
        ) : (
          <>
            <ModalField
              label="Detail"
              value={form.detail}
              onChange={(v) => setForm({ ...form, detail: v })}
            />
            <div className="grid grid-cols-2 gap-4">
              <ModalField
                label="Visits / month"
                type="number"
                value={form.visits_per_month}
                onChange={(v) => setForm({ ...form, visits_per_month: v })}
              />
              <ModalField
                label="Price multiplier"
                type="number"
                step="0.001"
                value={form.multiplier}
                onChange={(v) => setForm({ ...form, multiplier: v })}
              />
            </div>
          </>
        )}

        <ModalField
          label="Sort order"
          type="number"
          value={form.sort_order}
          onChange={(v) => setForm({ ...form, sort_order: v })}
        />

        <label className="flex items-center gap-2 text-sm text-ink/70">
          <input
            type="checkbox"
            checked={form.active}
            onChange={(e) => setForm({ ...form, active: e.target.checked })}
            className="rounded border-mist"
          />
          Active (shown to customers)
        </label>
      </form>
    </Modal>
  );
}

function ModalField({ label, value, onChange, type = "text", step }) {
  return (
    <label className="block">
      <span className="text-xs text-ink/45 mb-2 block">
        {label}
      </span>
      <input
        type={type}
        step={step}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-mist bg-white/80 px-4 py-2.5 text-sm text-ink focus:outline-none focus:border-pine transition-colors"
      />
    </label>
  );
}

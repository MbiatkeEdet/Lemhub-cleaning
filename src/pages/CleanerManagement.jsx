import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ConfirmDialog from "../components/ConfirmDialog";
import Modal from "../components/Modal";
import PhoneField from "../components/PhoneField";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import {
  adminDeleteCleaner,
  fetchStaffCleaners,
  reactivateCleaner,
  suspendCleaner,
  updateStaffCleaner,
} from "../lib/api";

const STATUS_FILTERS = [
  { value: "", label: "All" },
  { value: "active", label: "Active" },
  { value: "suspended", label: "Suspended" },
];

const STATUS_BADGE = {
  active: "border-pine/30 bg-sage-dim text-pine",
  suspended: "border-clay/40 bg-clay/10 text-clay",
  inactive: "border-mist bg-linen text-ink/50",
};

/**
 * The cleaner roster, shared by the admin and support consoles. The API
 * decides what this user may see and do — payout details and deletion are
 * admin-only — so the UI keys off `can_delete` and the fields it actually
 * receives rather than re-deriving permissions from the role.
 */
export default function CleanerManagement() {
  const toast = useToast();
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const [cleaners, setCleaners] = useState([]);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);

  const [suspendTarget, setSuspendTarget] = useState(null);
  const [suspendReason, setSuspendReason] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(
    (query = q, nextStatus = status) => {
      setLoading(true);
      setError("");
      return fetchStaffCleaners({ q: query, status: nextStatus })
        .then(setCleaners)
        .catch((err) => setError(err.message || "Could not load the roster."))
        .finally(() => setLoading(false));
    },
    [q, status]
  );

  useEffect(() => {
    load(q, status);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  function handleSearch(e) {
    e.preventDefault();
    load(q, status);
  }

  function startEdit(cleaner) {
    setEditing(cleaner);
    setForm({
      full_legal_name: cleaner.full_legal_name || "",
      display_first_name: cleaner.display_first_name || "",
      phone: cleaner.phone || "",
      years_experience: cleaner.years_experience ?? "",
      bio: cleaner.bio || "",
      specialties: (cleaner.specialties || []).join(", "),
      service_areas: (cleaner.service_areas || []).join(", "),
      payout_bank_name: cleaner.payout_bank_name || "",
      payout_account_name: cleaner.payout_account_name || "",
      payout_account_number: cleaner.payout_account_number || "",
    });
  }

  async function saveEdit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        full_legal_name: form.full_legal_name.trim(),
        display_first_name: form.display_first_name.trim(),
        phone: form.phone.trim() || null,
        bio: form.bio.trim() || null,
        years_experience: form.years_experience === "" ? null : Number(form.years_experience),
        specialties: toList(form.specialties),
        service_areas: toList(form.service_areas),
      };

      if (isAdmin) {
        payload.payout_bank_name = form.payout_bank_name.trim() || null;
        payload.payout_account_name = form.payout_account_name.trim() || null;
        payload.payout_account_number = form.payout_account_number.trim() || null;
      }

      await updateStaffCleaner(editing.id, payload);
      await load();
      toast.success(`${payload.display_first_name || payload.full_legal_name} updated.`);
      setEditing(null);
    } catch (err) {
      toast.error(err.message || "Couldn't save those changes.");
    } finally {
      setSaving(false);
    }
  }

  async function confirmSuspend() {
    if (!suspendReason.trim()) return;
    setBusyId(suspendTarget.id);
    try {
      const res = await suspendCleaner(suspendTarget.id, suspendReason.trim());
      await load();
      // The API reports jobs left hanging — surface that rather than a
      // generic success, because someone has to reassign them.
      toast[res?.data?.active_jobs > 0 ? "warning" : "success"](res.message);
      setSuspendTarget(null);
    } catch (err) {
      toast.error(err.message || "Couldn't suspend this cleaner.");
    } finally {
      setBusyId(null);
    }
  }

  async function handleReactivate(cleaner) {
    setBusyId(cleaner.id);
    try {
      const res = await reactivateCleaner(cleaner.id);
      await load();
      toast.success(res.message);
    } catch (err) {
      toast.error(err.message || "Couldn't reactivate this cleaner.");
    } finally {
      setBusyId(null);
    }
  }

  async function confirmDelete() {
    setBusyId(deleteTarget.id);
    try {
      const res = await adminDeleteCleaner(deleteTarget.id);
      await load();
      toast.success(res.message);
      setDeleteTarget(null);
    } catch (err) {
      // The usual case: they have history, so the API says suspend instead.
      toast.error(err.message || "Couldn't delete this cleaner.");
      setDeleteTarget(null);
    } finally {
      setBusyId(null);
    }
  }

  const alerting = cleaners.filter((c) => c.open_safety_alerts > 0);

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs text-ink/45 mb-3">Operations</p>
          <h1 className="font-display text-3xl text-ink mb-2">Cleaners</h1>
          <p className="text-ink/60">
            The roster is internal — it is no longer published on the website. Suspending someone
            removes their sign-in and takes them out of job matching immediately.
          </p>
        </div>
        {isAdmin && (
          <Link
            to="/admin/cleaners/new"
            className="shrink-0 rounded-md bg-pine px-5 py-2.5 text-sm font-medium text-linen transition-colors hover:bg-pine-light"
          >
            Add cleaner
          </Link>
        )}
      </div>

      {alerting.length > 0 && (
        <div className="mb-6 rounded-xl border border-clay/40 bg-clay/[0.06] px-5 py-4">
          <p className="text-sm text-ink">
            {alerting.length} cleaner{alerting.length === 1 ? " has" : "s have"} an open safety
            alert.{" "}
            <Link to="/staff/safety-alerts" className="text-clay border-b border-clay/40 pb-0.5">
              Work the alerts →
            </Link>
          </p>
        </div>
      )}

      <form onSubmit={handleSearch} className="flex flex-wrap gap-3 mb-5">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by name, email, or phone…"
          className="min-w-[14rem] flex-1 rounded-xl border border-mist bg-white/70 px-4 py-3 text-sm text-ink placeholder:text-ink/30 focus:outline-none focus:border-pine"
        />
        <button type="submit" className="rounded-xl bg-pine px-6 py-3 text-xs text-linen">
          Search
        </button>
      </form>

      <div className="flex flex-wrap gap-2 mb-8">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => setStatus(f.value)}
            className={"rounded-md px-4 py-1.5 text-sm font-medium border " +
              (status === f.value ? "border-pine bg-pine text-linen" : "border-mist text-ink/60 hover:text-ink")
            }
          >
            {f.label}
          </button>
        ))}
      </div>

      {error && <p className="mb-4 text-sm text-clay">{error}</p>}

      {loading ? (
        <div className="grid gap-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-28 animate-pulse rounded-xl border border-mist bg-white/40" />
          ))}
        </div>
      ) : cleaners.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-mist bg-white/40 px-6 py-10 text-center text-ink/50">
          No cleaners match this filter.
        </div>
      ) : (
        <div className="grid gap-3">
          {cleaners.map((c) => (
            <div key={c.id} className="rounded-xl border border-mist bg-white/60 px-5 py-4">
              <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-display text-ink">{c.display_first_name}</p>
                    <span className={"rounded-md border px-2 py-0.5 text-xs " + (STATUS_BADGE[c.status] || STATUS_BADGE.inactive)}>
                      {c.status}
                    </span>
                    {c.open_safety_alerts > 0 && (
                      <span className="rounded-md border border-clay/40 bg-clay/10 px-2 py-0.5 text-xs text-clay">
                        {c.open_safety_alerts} safety alert{c.open_safety_alerts === 1 ? "" : "s"}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-ink/50 mt-1">{c.full_legal_name}</p>
                  <p className="text-xs text-ink/50">
                    {c.email || "—"}
                    {c.phone && <> · {c.phone}</>}
                  </p>
                </div>
                <div className="text-right text-xs text-ink/50">
                  <p>
                    {c.active_jobs_count} active · {c.completed_jobs_count} completed
                  </p>
                  {c.rating_count > 0 && (
                    <p className="mt-1">
                      {c.rating_avg.toFixed(1)} ★ ({c.rating_count})
                    </p>
                  )}
                  {(c.service_areas || []).length > 0 && (
                    <p className="mt-1">{c.service_areas.join(", ")}</p>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4 border-t border-mist pt-3">
                <button
                  type="button"
                  onClick={() => startEdit(c)}
                  className="text-xs text-pine border-b border-ink/30 pb-0.5"
                >
                  Edit
                </button>
                {c.status === "active" ? (
                  <button
                    type="button"
                    disabled={busyId === c.id}
                    onClick={() => {
                      setSuspendTarget(c);
                      setSuspendReason("");
                    }}
                    className="text-xs text-clay/80 border-b border-clay/40 pb-0.5 disabled:opacity-50"
                  >
                    Suspend
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={busyId === c.id}
                    onClick={() => handleReactivate(c)}
                    className="text-xs text-pine border-b border-ink/30 pb-0.5 disabled:opacity-50"
                  >
                    {busyId === c.id ? "Reactivating…" : "Reactivate"}
                  </button>
                )}
                {c.can_delete && (
                  <button
                    type="button"
                    disabled={busyId === c.id}
                    onClick={() => setDeleteTarget(c)}
                    className="ml-auto text-xs text-ink/40 border-b border-mist pb-0.5 disabled:opacity-50"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={!!editing}
        onClose={() => setEditing(null)}
        title={editing ? `Edit ${editing.display_first_name}` : ""}
        description="Changes take effect immediately."
        size="xl"
        footer={
          <>
            <button
              type="button"
              onClick={() => setEditing(null)}
              disabled={saving}
              className="inline-flex items-center rounded-md border border-mist px-5 py-2.5 text-sm font-medium text-ink/60 transition-colors hover:border-ink/30 hover:text-ink disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="edit-cleaner"
              disabled={saving}
              className="inline-flex items-center rounded-md bg-pine px-5 py-2.5 text-sm font-medium text-linen transition-colors hover:bg-pine-light disabled:opacity-60"
            >
              {saving ? "Saving…" : "Save changes"}
            </button>
          </>
        }
      >
        {form && (
          <form id="edit-cleaner" onSubmit={saveEdit} className="grid gap-4 sm:grid-cols-2">
            <Field label="Full legal name" value={form.full_legal_name} onChange={(v) => setForm({ ...form, full_legal_name: v })} />
            <Field label="Display first name" value={form.display_first_name} onChange={(v) => setForm({ ...form, display_first_name: v })} />
            <PhoneField label="Phone" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} />
            <Field label="Years of experience" type="number" value={form.years_experience} onChange={(v) => setForm({ ...form, years_experience: v })} />
            <Field className="sm:col-span-2" label="Service areas (comma separated)" value={form.service_areas} onChange={(v) => setForm({ ...form, service_areas: v })} />
            <Field className="sm:col-span-2" label="Specialties (comma separated)" value={form.specialties} onChange={(v) => setForm({ ...form, specialties: v })} />
            <Field className="sm:col-span-2" label="Bio" value={form.bio} onChange={(v) => setForm({ ...form, bio: v })} />

            {isAdmin && (
              <>
                <p className="sm:col-span-2 mt-2 text-xs text-ink/45">Payout details</p>
                <Field label="Bank" value={form.payout_bank_name} onChange={(v) => setForm({ ...form, payout_bank_name: v })} />
                <Field label="Account name" value={form.payout_account_name} onChange={(v) => setForm({ ...form, payout_account_name: v })} />
                <Field className="sm:col-span-2" label="Account number" value={form.payout_account_number} onChange={(v) => setForm({ ...form, payout_account_number: v })} />
              </>
            )}
          </form>
        )}
      </Modal>

      <Modal
        open={!!suspendTarget}
        onClose={() => setSuspendTarget(null)}
        title={suspendTarget ? `Suspend ${suspendTarget.display_first_name}?` : ""}
        description="They lose access straight away and stop being matched to jobs. Any job they are already on stays assigned until you move it."
        size="sm"
        footer={
          <>
            <button
              type="button"
              onClick={() => setSuspendTarget(null)}
              disabled={busyId === suspendTarget?.id}
              className="inline-flex items-center rounded-md border border-mist px-5 py-2.5 text-sm font-medium text-ink/60 transition-colors hover:border-ink/30 hover:text-ink disabled:opacity-60"
            >
              Keep active
            </button>
            <button
              type="button"
              onClick={confirmSuspend}
              disabled={busyId === suspendTarget?.id || !suspendReason.trim()}
              className="inline-flex items-center rounded-md bg-clay px-5 py-2.5 text-sm font-medium text-linen transition-colors hover:bg-clay/90 disabled:opacity-60"
            >
              {busyId === suspendTarget?.id ? "Suspending…" : "Suspend"}
            </button>
          </>
        }
      >
        <label className="block">
          <span className="mb-2 block text-xs text-ink/45">Reason (required — goes to the audit log)</span>
          <textarea
            value={suspendReason}
            onChange={(e) => setSuspendReason(e.target.value)}
            rows={3}
            placeholder="Why are they being suspended?"
            className="w-full resize-none rounded-xl border border-mist bg-white/80 px-4 py-3 text-sm text-ink placeholder:text-ink/30 focus:outline-none focus:border-pine"
          />
        </label>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        busy={busyId === deleteTarget?.id}
        tone="danger"
        title={deleteTarget ? `Delete ${deleteTarget.display_first_name}?` : ""}
        description="This removes the cleaner profile for good. Anyone with bookings, tips, payouts or reviews on file cannot be deleted — suspend them instead."
        confirmLabel="Delete"
      />
    </div>
  );
}

function toList(value) {
  return value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function Field({ label, value, onChange, type = "text", className = "" }) {
  return (
    <label className={"block " + className}>
      <span className="text-xs text-ink/45 mb-2 block">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-mist bg-white/70 px-4 py-3 text-sm text-ink placeholder:text-ink/30 focus:outline-none focus:border-pine"
      />
    </label>
  );
}

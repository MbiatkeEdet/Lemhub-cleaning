import { useEffect, useState } from "react";
import Modal from "../../components/Modal";
import { useToast } from "../../context/ToastContext";
import {
  adminAssignBooking,
  adminCancelBooking,
  fetchAdminBookings,
  fetchStaffCleaners,
  isBookingCancellable,
} from "../../lib/api";
import { statusBadgeClasses, statusLabel } from "../../lib/status";
import { formatShortDate } from "../../lib/dates";

const STATUS_FILTERS = [
  { value: "", label: "All" },
  { value: "confirmed", label: "Confirmed" },
  { value: "assigned", label: "Assigned" },
  { value: "in_progress", label: "In progress" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

export default function AdminBookings() {
  const toast = useToast();
  const [bookings, setBookings] = useState([]);
  const [cleaners, setCleaners] = useState([]);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [assigningId, setAssigningId] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelReason, setCancelReason] = useState("");

  function load(nextStatus = status) {
    setLoading(true);
    return fetchAdminBookings(nextStatus)
      .then(setBookings)
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    // Only active cleaners can take a job — a suspended one must not appear
    // in the assignment dropdown.
    fetchStaffCleaners({ status: "active" }).then(setCleaners);
  }, []);

  useEffect(() => {
    load(status);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  async function handleAssign(bookingId, cleanerProfileId) {
    if (!cleanerProfileId) return;
    setAssigningId(bookingId);
    try {
      await adminAssignBooking(bookingId, Number(cleanerProfileId));
      await load();
      toast.success("Booking assigned.");
    } catch (err) {
      toast.error(err.message || "Couldn't assign this booking.");
    } finally {
      setAssigningId(null);
    }
  }

  function requestCancel(booking) {
    setCancelTarget(booking);
    setCancelReason("");
  }

  async function confirmCancel() {
    if (!cancelTarget) return;
    setCancellingId(cancelTarget.id);
    try {
      await adminCancelBooking(cancelTarget.id, cancelReason.trim() || null);
      await load();
      toast.success("Booking cancelled.");
      setCancelTarget(null);
    } catch (err) {
      toast.error(err.message || "Couldn't cancel this booking.");
    } finally {
      setCancellingId(null);
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <p className="text-xs text-ink/45 mb-3">Admin</p>
      <h1 className="font-display text-3xl text-ink mb-6">Bookings</h1>

      <div className="flex flex-wrap gap-2 mb-8">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => setStatus(f.value)}
            className={"rounded-md px-4 py-1.5 text-sm font-medium border " +
              (status === f.value
                ? "border-pine bg-pine text-linen"
                : "border-mist text-ink/60 hover:text-ink")
            }
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid gap-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-xl border border-mist bg-white/40" />
          ))}
        </div>
      ) : bookings.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-mist bg-white/40 px-6 py-10 text-center text-ink/50">
          No bookings match this filter.
        </div>
      ) : (
        <div className="grid gap-3">
          {bookings.map((b) => (
            <div key={b.id} className="rounded-xl border border-mist bg-white/60 px-5 py-4 transition-shadow">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                <div>
                  <p className="font-display text-ink">
                    {b.customer_name} · {b.apartment_label}
                  </p>
                  <p className="text-xs text-pine">
                    {b.scheduled_date
                      ? `${formatShortDate(b.scheduled_date)}${
                          b.scheduled_slot_window ? ` · arrives ${b.scheduled_slot_window}` : ""
                        }`
                      : "No date scheduled"}
                  </p>
                  <p className="text-xs text-ink/50">{b.service_address_text}</p>
                </div>
                <span className={"inline-block rounded-md border px-2.5 py-0.5 text-sm font-medium " + statusBadgeClasses(b.status)}>
                  {statusLabel(b.status)}
                </span>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-3">
                  <p className="text-sm text-ink/70">
                    {b.assigned_cleaner ? (
                      <>
                        Assigned to <span className="text-ink">{b.assigned_cleaner}</span>
                        {b.assigned_via && (
                          <span className="text-ink/40"> ({b.assigned_via.replace(/_/g, " ")})</span>
                        )}
                      </>
                    ) : ("Not yet assigned"
                    )}
                  </p>
                  <select
                    defaultValue=""
                    disabled={assigningId === b.id}
                    onChange={(e) => handleAssign(b.id, e.target.value)}
                    className="rounded-lg border border-mist bg-white/70 px-3 py-1.5 text-xs text-ink focus:outline-none focus:border-pine"
                  >
                    <option value="" disabled>
                      {b.assigned_cleaner ? "Reassign to…" : "Assign to…"}
                    </option>
                    {cleaners.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.display_first_name} ({(c.service_areas || []).join(", ") || "no areas set"})
                      </option>
                    ))}
                  </select>
                </div>
                {isBookingCancellable(b.status) && (
                  <button
                    type="button"
                    disabled={cancellingId === b.id}
                    onClick={() => requestCancel(b)}
                    className="text-xs text-clay/80 border-b border-clay/40 pb-0.5 disabled:opacity-50"
                  >
                    {cancellingId === b.id ? "Cancelling…" : "Cancel"}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={!!cancelTarget}
        onClose={() => setCancelTarget(null)}
        title="Cancel this booking?"
        description={cancelTarget ? `${cancelTarget.customer_name} · ${cancelTarget.apartment_label}` : ""}
        size="sm"
        footer={
          <>
            <button
              type="button"
              onClick={() => setCancelTarget(null)}
              disabled={cancellingId === cancelTarget?.id}
              className="inline-flex items-center rounded-md border border-mist px-5 py-2.5 text-sm font-medium text-ink/60 transition-colors hover:border-ink/30 hover:text-ink disabled:opacity-60"
            >
              Keep booking
            </button>
            <button
              type="button"
              onClick={confirmCancel}
              disabled={cancellingId === cancelTarget?.id}
              className="inline-flex items-center rounded-md bg-clay px-5 py-2.5 text-sm font-medium text-linen transition-colors hover:bg-clay/90 disabled:opacity-60"
            >
              {cancellingId === cancelTarget?.id ? "Cancelling…" : "Cancel booking"}
            </button>
          </>
        }
      >
        <label className="block">
          <span className="mb-2 block text-xs text-ink/45">
            Reason (optional)
          </span>
          <textarea
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            rows={3}
            placeholder="Let the customer know why (optional)"
            className="w-full resize-none rounded-xl border border-mist bg-white/80 px-4 py-3 text-sm text-ink placeholder:text-ink/30 focus:outline-none focus:border-pine"
          />
        </label>
      </Modal>
    </div>
  );
}


import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import ConfirmDialog from "../components/ConfirmDialog";
import MetricTile from "../components/MetricTile";
import PaymentHistory from "../components/PaymentHistory";
import PaymentMethodManager from "../components/PaymentMethodManager";
import RecurringPlanManager from "../components/RecurringPlanManager";
import SupportRequestForm from "../components/SupportRequestForm";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { cancelBooking, fetchMyBookings, isBookingCancellable } from "../lib/api";
import { BOOKING_STATUS_COLOR } from "../lib/chartTheme";
import { daysUntil, formatDayAndMonth, monthShort, todayISO } from "../lib/dates";
import { formatKobo } from "../lib/money";
import { formatBps } from "../lib/discount";
import { statusBadgeClasses, statusLabel } from "../lib/status";

const FILTERS = [
  { key: "upcoming", label: "Upcoming" },
  { key: "past", label: "Past" },
  { key: "all", label: "All" },
];

const ACTIVE_STATUSES = ["pending_confirmation", "awaiting_payment_manual", "confirmed", "assigned", "in_progress"];

export default function Dashboard() {
  const { user, customer } = useAuth();
  const toast = useToast();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [helpBookingId, setHelpBookingId] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [filter, setFilter] = useState("upcoming");

  function load() {
    return fetchMyBookings().then(setBookings);
  }

  useEffect(() => {
    load().finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { nextVisit, stats, filtered } = useMemo(() => {
    const today = todayISO();

    const upcoming = bookings
      .filter((b) => ACTIVE_STATUSES.includes(b.status) && (!b.scheduled_date || b.scheduled_date >= today))
      .sort((a, b) => (a.scheduled_date || "9999").localeCompare(b.scheduled_date || "9999"));

    const past = bookings.filter(
      (b) => !ACTIVE_STATUSES.includes(b.status) || (b.scheduled_date && b.scheduled_date < today)
    );

    const completed = bookings.filter((b) => b.status === "completed");
    const cancelled = bookings.filter((b) => b.status === "cancelled");

    return {
      nextVisit: upcoming[0] || null,
      stats: {
        upcoming: upcoming.length,
        completed: completed.length,
        cancelled: cancelled.length,
      },
      filtered: filter === "upcoming" ? upcoming : filter === "past" ? past : bookings,
    };
  }, [bookings, filter]);

  async function confirmCancel() {
    if (!cancelTarget) return;
    setCancellingId(cancelTarget.id);
    try {
      await cancelBooking(cancelTarget.id);
      await load();
      toast.success("Booking cancelled. If it was already paid, we'll process your refund.");
      setCancelTarget(null);
    } catch (err) {
      toast.error(err.message || "Couldn't cancel this booking.");
    } finally {
      setCancellingId(null);
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-14 lg:py-20">
      <section className="relative mb-6 flex flex-wrap items-center justify-between gap-6 overflow-hidden rounded-xl border border-mist gradient-brand p-8">
        <div className="relative">
          <p className="mb-3 text-xs text-ink/50">Your dashboard</p>
          <h1 className="mb-1 font-display text-3xl text-ink">
            Welcome back, {user?.name?.split(" ")[0]}.
          </h1>
          <p className="text-ink/60">{user?.email}</p>
        </div>
        <Link
          to="/book"
          className="relative inline-flex items-center gap-2 rounded-md bg-pine px-6 py-3 text-sm font-medium text-linen transition-all duration-300 hover:-translate-y-0.5 hover:bg-pine-light"
        >
          Book another clean
          <span aria-hidden="true">→</span>
        </Link>
      </section>

      {nextVisit && <NextVisitCard booking={nextVisit} />}

      <div className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricTile
          label="Upcoming visits"
          value={stats.upcoming}
          hint={nextVisit?.scheduled_date ? `Next on ${formatDayAndMonth(nextVisit.scheduled_date)}` : undefined}
        />
        <MetricTile label="Cleans completed" value={stats.completed} />
        <MetricTile
          label="Lifetime spend"
          value={formatKobo(customer?.lifetime_spend_kobo ?? 0)}
          hint={`${customer?.total_bookings_count ?? 0} bookings all-time`}
        />
        <MetricTile
          label="Customer since"
          value={
            customer?.first_booking_at
              ? new Date(customer.first_booking_at).toLocaleDateString(undefined, {
                  month: "short",
                  year: "numeric",
                })
              : "—"
          }
          hint={
            customer?.last_booking_at
              ? `Last booked ${new Date(customer.last_booking_at).toLocaleDateString()}`
              : undefined
          }
        />
      </div>

      <p className="mb-4 text-xs text-ink/50">Recurring cleaning</p>
      <div className="mb-12">
        <RecurringPlanManager />
      </div>

      <p className="mb-4 text-xs text-ink/50">Payment methods</p>
      <div className="mb-12">
        <PaymentMethodManager />
      </div>

      <p className="mb-4 text-xs text-ink/50">Payment history</p>
      <div className="mb-12">
        <PaymentHistory />
      </div>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-ink/50">Your bookings</p>
        <div className="flex items-center gap-1 rounded-full border border-mist bg-white/70 p-1">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => setFilter(f.key)}
              aria-pressed={filter === f.key}
              className={"rounded-md px-3.5 py-1.5 text-sm font-medium transition-colors " +
                (filter === f.key ? "bg-pine text-linen" : "text-ink/50 hover:text-ink")
              }
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid gap-3">
          {[0, 1].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-2xl border border-mist bg-white/40" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState filter={filter} />
      ) : (
        <div className="grid gap-3">
          {filtered.map((b) => (
            <BookingRow
              key={b.id}
              booking={b}
              user={user}
              helpOpen={helpBookingId === b.id}
              onToggleHelp={() => setHelpBookingId(helpBookingId === b.id ? null : b.id)}
              onCancel={() => setCancelTarget(b)}
              cancelling={cancellingId === b.id}
            />
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!cancelTarget}
        title="Cancel this booking?"
        description={
          cancelTarget
            ? `${cancelTarget.apartment_label} · ${cancelTarget.frequency_label}${
                cancelTarget.scheduled_date ? ` on ${formatDayAndMonth(cancelTarget.scheduled_date)}` : ""
              }. If it's already paid, we'll process a refund automatically.`
            : ""
        }
        tone="danger"
        confirmLabel="Cancel booking"
        cancelLabel="Keep booking"
        busy={cancellingId === cancelTarget?.id}
        onConfirm={confirmCancel}
        onClose={() => setCancelTarget(null)}
      />
    </div>
  );
}

/** The one thing a customer opens this page to check. */
function NextVisitCard({ booking }) {
  const days = booking.scheduled_date ? daysUntil(booking.scheduled_date) : null;

  return (
    <section className="mb-6 overflow-hidden rounded-xl border border-mist bg-ink p-6 text-linen lg:p-8">
      <p className="mb-4 text-xs text-ink/50-light">
        Your next clean
      </p>
      <div className="grid gap-6 sm:grid-cols-[1.2fr_0.8fr] sm:items-end">
        <div>
          <p className="font-display text-3xl leading-tight text-white lg:text-4xl">
            {booking.scheduled_date ? formatDayAndMonth(booking.scheduled_date) : "Date to be confirmed"}
          </p>
          <p className="mt-2 text-linen/70">
            {booking.scheduled_slot_window
              ? `Your cleaner arrives ${booking.scheduled_slot_window}`
              : "We'll confirm your arrival window shortly"}
          </p>
          <p className="mt-1 text-xs text-linen/45">
            {booking.apartment_label} · {booking.frequency_label}
          </p>
        </div>

        <div className="grid gap-3">
          <div className="rounded-2xl border border-white/10 bg-white/8 p-4">
            <p className="text-xs text-ink/50-light">
              {days === null ? "Status" : days === 0 ? "Today" : days === 1 ? "Tomorrow" : "Countdown"}
            </p>
            <p className="font-display text-2xl text-white">
              {days === null
                ? statusLabel(booking.status)
                : days <= 0
                ? "Today"
                : `${days} day${days === 1 ? "" : "s"}`}
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
            <p className="text-xs text-linen/50">Your cleaner</p>
            <p className="text-sm text-linen">
              {booking.assigned_cleaner_first_name || "Being matched now"}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function BookingRow({ booking: b, user, helpOpen, onToggleHelp, onCancel, cancelling }) {
  return (
    <article className="rounded-2xl border border-mist bg-white/70 px-5 py-4 transition-shadow">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-4">
          <span
            className="hidden h-12 w-12 shrink-0 flex-col items-center justify-center rounded-xl font-display text-linen sm:flex"
            style={{ backgroundColor: BOOKING_STATUS_COLOR[b.status] || "#0E8A79" }}
            aria-hidden="true"
          >
            {b.scheduled_date ? (
              <>
                <span className="text-base leading-none">{b.scheduled_date.slice(8, 10)}</span>
                <span className="mt-0.5 text-[10px] opacity-80">
                  {monthShort(b.scheduled_date)}
                </span>
              </>
            ) : (
              <span className="text-lg leading-none">{b.apartment_label?.[0] || "•"}</span>
            )}
          </span>
          <div className="min-w-0">
            <p className="truncate font-display text-ink">
              {b.apartment_label} · {b.frequency_label}
            </p>
            <p className="text-xs text-ink/50">
              {b.scheduled_date
                ? `${formatDayAndMonth(b.scheduled_date)}${b.scheduled_slot_window ? ` · arrives ${b.scheduled_slot_window}` : ""}`
                : `Requested ${new Date(b.created_at).toLocaleDateString()}`}
              {b.assigned_cleaner_first_name && <> · Cleaner: {b.assigned_cleaner_first_name}</>}
            </p>
            {b.group && (
              <p className="mt-0.5 text-xs text-ink/40">
                Visit in a {b.group.visits_count}-clean booking
                {b.group.discount_bps > 0 ? ` · ${formatBps(b.group.discount_bps)} off` : ""}
                {b.group.payment_mode === "per_visit" && b.status === "pending_confirmation"
                  ? " · charged shortly before the day"
                  : ""}
              </p>
            )}
            {b.group?.is_suspended && (
              <p className="mt-1 rounded-md border border-clay/20 bg-clay/[0.05] px-2 py-1 text-xs text-clay">
                On hold — {b.group.suspended_reason} Add a card below to restart it.
              </p>
            )}
          </div>
        </div>

        <div className="text-right">
          <p className="font-mono text-sm text-ink">{formatKobo(b.per_visit_price_kobo)}</p>
          <span
            className={"mt-1 inline-block rounded-md border px-2.5 py-0.5 text-sm font-medium " +
              statusBadgeClasses(b.status)
            }
          >
            {statusLabel(b.status)}
          </span>
          <div className="mt-1.5 flex justify-end gap-3">
            <button
              type="button"
              onClick={onToggleHelp}
              className="text-xs text-ink/40 hover:text-ink"
            >
              Need help?
            </button>
            {isBookingCancellable(b.status) && (
              <button
                type="button"
                disabled={cancelling}
                onClick={onCancel}
                className="text-xs text-clay/70 hover:text-clay disabled:opacity-50"
              >
                {cancelling ? "Cancelling…" : "Cancel"}
              </button>
            )}
          </div>
        </div>
      </div>

      {helpOpen && (
        <div className="mt-4 border-t border-mist pt-4">
          <SupportRequestForm
            bookingId={b.id}
            defaultName={user?.name || ""}
            defaultEmail={user?.email || ""}
            onSent={onToggleHelp}
          />
        </div>
      )}
    </article>
  );
}

function EmptyState({ filter }) {
  return (
    <div className="rounded-2xl border border-dashed border-mist bg-white/40 px-6 py-12 text-center">
      <p className="mb-4 text-ink/60">
        {filter === "upcoming"
          ? "You have no upcoming cleans booked."
          : filter === "past"
          ? "Nothing in your history yet."
          : "You haven't booked a clean yet."}
      </p>
      <Link
        to="/book"
        className="inline-flex items-center rounded-md bg-pine px-6 py-3 text-sm font-medium text-linen transition-colors hover:bg-pine-light"
      >
        Book a clean →
      </Link>
    </div>
  );
}




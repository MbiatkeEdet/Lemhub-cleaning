import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import BarList from "../../components/BarList";
import CompositionBar from "../../components/CompositionBar";
import FunnelChart from "../../components/FunnelChart";
import HeatStrip from "../../components/HeatStrip";
import MetricTile from "../../components/MetricTile";
import TrendChart from "../../components/TrendChart";
import { fetchAdminOverview, fetchAdminOverviewTrends } from "../../lib/api";
import {
  BOOKING_STATUS_COLOR,
  CATEGORICAL,
  INK,
  STATUS,
  formatPercent,
} from "../../lib/chartTheme";
import { formatKobo } from "../../lib/money";

const STATUS_LABEL = {
  pending_confirmation: "Pending confirmation",
  awaiting_payment_manual: "Awaiting payment",
  confirmed: "Confirmed",
  assigned: "Assigned",
  in_progress: "In progress",
  completed: "Completed",
  cancelled: "Cancelled",
};

const RANGES = [
  { days: 7, label: "7d" },
  { days: 30, label: "30d" },
  { days: 90, label: "90d" },
];

const TABS = [
  { key: "pulse", label: "Pulse" },
  { key: "demand", label: "Demand & schedule" },
  { key: "money", label: "Revenue & payments" },
  { key: "people", label: "Customers & cleaners" },
  { key: "service", label: "Service quality" },
];

export default function AdminOverview() {
  const [data, setData] = useState(null);
  const [trends, setTrends] = useState(null);
  const [range, setRange] = useState(30);
  const [loading, setLoading] = useState(true);
  const [trendLoading, setTrendLoading] = useState(false);
  const [error, setError] = useState("");
  const [tab, setTab] = useState("pulse");

  useEffect(() => {
    Promise.all([fetchAdminOverview(), fetchAdminOverviewTrends(range)])
      .then(([overview, series]) => {
        setData(overview);
        setTrends(series);
      })
      .catch((err) => setError(err.message || "Could not load the dashboard."))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (loading) return;
    setTrendLoading(true);
    fetchAdminOverviewTrends(range)
      .then(setTrends)
      .catch(() => {})
      .finally(() => setTrendLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [range]);

  if (loading) return <DashboardSkeleton />;

  if (error) {
    return (
      <div className="mx-auto max-w-2xl px-8 py-24 text-center">
        <p className="text-clay">{error}</p>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="mx-auto max-w-[1400px] px-6 py-8 lg:px-10 lg:py-10">
      <Header data={data} />
      <AlertRail data={data} />

      <nav className="mt-8 flex gap-1 overflow-x-auto border-b border-mist pb-px" aria-label="Dashboard sections">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            aria-current={tab === t.key ? "page" : undefined}
            className={"-mb-px shrink-0 border-b-2 px-4 py-3 text-xs transition-colors " +
              (tab === t.key
                ? "border-pine text-pine"
                : "border-transparent text-ink/45 hover:text-ink")
            }
          >
            {t.label}
          </button>
        ))}
      </nav>

      <div className="mt-6">
        {tab === "pulse" && (
          <PulseTab
            data={data}
            trends={trends}
            range={range}
            setRange={setRange}
            trendLoading={trendLoading}
          />
        )}
        {tab === "demand" && <DemandTab data={data} trends={trends} />}
        {tab === "money" && <MoneyTab data={data} trends={trends} />}
        {tab === "people" && <PeopleTab data={data} />}
        {tab === "service" && <ServiceTab data={data} />}
      </div>

      <footer className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-mist pt-6">
        <div className="flex flex-wrap gap-3">
          <QuickLink to="/admin/bookings" primary>
            Review bookings
          </QuickLink>
          <QuickLink to="/admin/payments">Check payments</QuickLink>
          <QuickLink to="/admin/customers">Customers</QuickLink>
          <QuickLink to="/admin/activity">Activity log</QuickLink>
          <QuickLink to="/admin/settings">Settings</QuickLink>
        </div>
      </footer>
    </div>
  );
}

/* ---------------------------------------------------------------- header */

function Header({ data }) {
  const generated = data.generated_at ? new Date(data.generated_at) : null;

  return (
    <section className="relative overflow-hidden rounded-xl border border-mist gradient-brand p-7 lg:p-9">
      <div className="relative grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
        <div>
          <p className="mb-3 text-xs text-pine/65">
            Operating dashboard
          </p>
          <h1 className="mb-4 font-display text-3xl leading-tight text-ink lg:text-5xl">
            Everything happening at TidyNow, on one screen.
          </h1>
          <p className="max-w-2xl leading-relaxed text-ink/65">
            Demand, conversion, revenue, roster utilisation, service quality and support load —
            each panel is a decision the team can act on today.
          </p>
          {generated && (
            <p className="mt-4 text-xs text-ink/40">
              Refreshed {generated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </p>
          )}
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <HeroMetric label="Bookings this month" value={data.bookings.this_month} />
          <HeroMetric label="Revenue this month" value={formatKobo(data.revenue.this_month_kobo)} />
          <HeroMetric
            label="Completion rate"
            value={formatPercent(data.analytics.completion_rate_percent)}
          />
          <HeroMetric label="Scheduled today" value={data.schedule.today} />
        </div>
      </div>
    </section>
  );
}

function HeroMetric({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/70 bg-white/75 p-4 shadow-sm backdrop-blur">
      <p className="mb-1 text-xs text-ink/45">{label}</p>
      <p className="font-display text-xl text-ink">{value}</p>
    </div>
  );
}

/** The things that need a human today, promoted above every other panel. */
function AlertRail({ data }) {
  const alerts = [
    {
      label: "Safety alerts",
      value: data.safety.active_alerts,
      to: "/staff/safety-alerts",
      urgent: data.safety.active_alerts > 0,
    },
    {
      label: "Unassigned upcoming",
      value: data.schedule.upcoming_unassigned,
      to: "/admin/bookings",
      urgent: data.schedule.upcoming_unassigned > 0,
    },
    {
      label: "Open tickets",
      value: data.support.open_tickets,
      to: "/support/console",
      urgent: data.support.oldest_open_days > 2,
    },
    {
      label: "Payments to review",
      value: data.payments.awaiting_manual_review,
      to: "/admin/payments",
      urgent: data.payments.awaiting_manual_review > 0,
    },
    {
      label: "Applications waiting",
      value: data.cleaners.pending_applications,
      to: "/admin/applications",
      urgent: false,
    },
    {
      label: "Payouts owed",
      value: formatKobo(data.payouts.pending_kobo),
      to: "/admin/payouts",
      urgent: false,
    },
  ];

  return (
    <section className="mt-6" aria-label="Needs attention">
      <p className="mb-3 text-xs text-ink/40">
        Needs attention
      </p>
      <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-6">
        {alerts.map((a) => (
          <Link
            key={a.label}
            to={a.to}
            className={"group rounded-2xl border p-4 transition-all duration-300 hover:-translate-y-0.5 " +
              (a.urgent
                ? "border-clay/40 bg-clay/[0.06] hover:border-clay"
                : "border-mist bg-white/70 hover:border-pine")
            }
          >
            <p className="mb-1 text-xs text-ink/45">
              {a.label}
            </p>
            <p
              className={"font-display text-xl " + (a.urgent ? "text-clay" : "text-ink")}
            >
              {a.value}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}

/* ----------------------------------------------------------------- pulse */

function PulseTab({ data, trends, range, setRange, trendLoading }) {
  const statusSegments = useMemo(
    () =>
      Object.entries(data.bookings.by_status).map(([key, value]) => ({
        key,
        label: STATUS_LABEL[key] || key,
        value,
        color: BOOKING_STATUS_COLOR[key] || STATUS.neutral,
      })),
    [data]
  );

  return (
    <div className="grid gap-4">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricTile label="Bookings today" value={data.bookings.today} />
        <MetricTile label="Bookings this week" value={data.bookings.this_week} />
        <MetricTile
          label="Bookings this month"
          value={data.bookings.this_month}
          delta={percentChange(data.bookings.last_month, data.bookings.this_month)}
        />
        <MetricTile
          label="Revenue this month"
          value={formatKobo(data.revenue.this_month_kobo)}
          delta={data.revenue.month_over_month_percent}
        />
        <MetricTile
          label="Average ticket"
          value={formatKobo(data.revenue.average_ticket_kobo)}
          hint="Per successful transaction this month"
        />
        <MetricTile
          label="Payment success rate"
          value={formatPercent(data.payments.success_rate_percent)}
          hint={`${data.payments.failed} failed · ${data.payments.abandoned} abandoned`}
        />
        <MetricTile
          label="Repeat customer rate"
          value={formatPercent(data.customers.repeat_rate_percent)}
          hint={`${data.customers.repeat_customers} of ${data.customers.with_a_booking} have booked twice or more`}
        />
        <MetricTile
          label="Cleaner utilisation"
          value={formatPercent(data.cleaners.utilisation_percent)}
          hint={`${data.cleaners.idle_active} active cleaners have no jobs yet`}
        />
      </div>

      <div className="flex items-center justify-between gap-4">
        <p className="text-xs text-ink/40">
          Trends {trendLoading ? "· updating…" : ""}
        </p>
        <RangeToggle range={range} setRange={setRange} />
      </div>

      {trends && trends.length > 0 && (
        <div className="grid gap-4 xl:grid-cols-2">
          <TrendChart
            title={`Bookings created — last ${range} days`}
            data={trends.map((t) => ({ date: t.date, value: t.bookings }))}
            color={INK}
          />
          <TrendChart
            title={`Revenue collected — last ${range} days`}
            data={trends.map((t) => ({ date: t.date, value: t.revenue_kobo }))}
            formatValue={formatKobo}
            color={INK}
          />
          <TrendChart
            title={`Cleans completed — last ${range} days`}
            data={trends.map((t) => ({ date: t.date, value: t.completed }))}
            color={INK}
          />
          <TrendChart
            title={`New customers — last ${range} days`}
            data={trends.map((t) => ({ date: t.date, value: t.new_customers }))}
            color={INK}
          />
        </div>
      )}

      <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <FunnelChart
          title="Booking funnel"
          caption={`${formatPercent(data.funnel.request_to_paid_percent)} of requests get paid · ${formatPercent(
            data.funnel.paid_to_completed_percent
          )} of paid bookings complete`}
          stages={data.funnel.stages}
        />
        <CompositionBar
          title="Booking mix"
          caption="Every booking, by the state it is in right now"
          segments={statusSegments}
        />
      </div>
    </div>
  );
}

function RangeToggle({ range, setRange }) {
  return (
    <div className="flex items-center gap-1 rounded-full border border-mist bg-white/70 p-1">
      {RANGES.map((r) => (
        <button
          key={r.days}
          type="button"
          onClick={() => setRange(r.days)}
          aria-pressed={range === r.days}
          className={"rounded-md px-3 py-1 text-sm font-medium transition-colors " +
            (range === r.days ? "bg-pine text-linen" : "text-ink/50 hover:text-ink")
          }
        >
          {r.label}
        </button>
      ))}
    </div>
  );
}

/* ---------------------------------------------------------------- demand */

function DemandTab({ data, trends }) {
  const schedule = data.schedule;

  return (
    <div className="grid gap-4">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricTile label="Scheduled today" value={schedule.today} />
        <MetricTile label="Scheduled tomorrow" value={schedule.tomorrow} />
        <MetricTile
          label="Next 14 days"
          value={schedule.upcoming_total}
          hint="Bookings with a date on the calendar"
        />
        <MetricTile
          label="Still unassigned"
          value={schedule.upcoming_unassigned}
          tone={schedule.upcoming_unassigned > 0 ? "urgent" : "default"}
          hint="Upcoming visits with no cleaner yet"
        />
      </div>

      <HeatStrip
        title="The next two weeks"
        caption="Where demand is concentrated — darker means a busier day"
        cells={schedule.next_14_days.map((d) => ({
          key: d.date,
          label: d.label.replace(/ \d{4}$/, ""),
          value: d.bookings,
          sublabel: d.unassigned ? `${d.unassigned} unassigned` : null,
        }))}
      />

      <div className="grid gap-4 xl:grid-cols-2">
        <BarList
          title="Which arrival window customers pick"
          caption="All bookings ever scheduled, by slot"
          colorful
          items={schedule.slot_demand.map((s) => ({
            label: `${s.label} — arrives ${s.window}`,
            value: s.count,
          }))}
        />
        <BarList
          title="Demand by apartment size"
          caption="Bookings per apartment type"
          colorful
          items={data.bookings.by_apartment.map((a) => ({ label: a.label, value: a.count }))}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <BarList
          title="Frequency chosen"
          caption="One-off versus recurring demand"
          colorful
          items={data.bookings.by_frequency.map((f) => ({ label: f.label, value: f.count }))}
        />
        <BarList
          title="Where bookings come from"
          caption="Guest checkout, signed-in customers, and recurring auto-bookings"
          colorful
          items={data.bookings.by_source.map((s) => ({ label: s.label, value: s.count }))}
        />
      </div>

      {trends && trends.length > 0 && (
        <div className="grid gap-4 xl:grid-cols-2">
          <TrendChart
            title="Bookings created"
            data={trends.map((t) => ({ date: t.date, value: t.bookings }))}
            color={INK}
          />
          <TrendChart
            title="Bookings cancelled"
            data={trends.map((t) => ({ date: t.date, value: t.cancelled }))}
            color={INK}
          />
        </div>
      )}
    </div>
  );
}

/* ----------------------------------------------------------------- money */

function MoneyTab({ data, trends }) {
  return (
    <div className="grid gap-4">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricTile
          label="Revenue this month"
          value={formatKobo(data.revenue.this_month_kobo)}
          delta={data.revenue.month_over_month_percent}
        />
        <MetricTile
          label="Revenue last month"
          value={formatKobo(data.revenue.last_month_kobo)}
        />
        <MetricTile
          label="Lifetime revenue"
          value={formatKobo(data.revenue.lifetime_kobo)}
        />
        <MetricTile
          label="Average ticket"
          value={formatKobo(data.revenue.average_ticket_kobo)}
        />
        <MetricTile
          label="Booked but unpaid"
          value={formatKobo(data.revenue.booked_value_pending_kobo)}
          hint="Value sitting in pending and awaiting-payment bookings"
          tone={data.revenue.booked_value_pending_kobo > 0 ? "urgent" : "default"}
        />
        <MetricTile
          label="Tips this month"
          value={formatKobo(data.revenue.tips_this_month_kobo)}
          hint={`${formatKobo(data.revenue.tips_lifetime_kobo)} lifetime — all of it goes to cleaners`}
        />
        <MetricTile
          label="Payment success rate"
          value={formatPercent(data.payments.success_rate_percent)}
          hint={`${data.payments.this_month_count} successful this month`}
        />
        <MetricTile
          label="Payouts owed to cleaners"
          value={formatKobo(data.payouts.pending_kobo)}
          hint={`Across ${data.payouts.pending_cleaners} cleaners`}
        />
      </div>

      {trends && trends.length > 0 && (
        <div className="grid gap-4 xl:grid-cols-2">
          <TrendChart
            title="Revenue collected"
            data={trends.map((t) => ({ date: t.date, value: t.revenue_kobo }))}
            formatValue={formatKobo}
            color={INK}
          />
          <TrendChart
            title="Successful transactions"
            data={trends.map((t) => ({ date: t.date, value: t.successful_transactions }))}
            color={INK}
          />
        </div>
      )}

      <div className="grid gap-4 xl:grid-cols-2">
        <BarList
          title="Volume by gateway"
          caption="Money actually collected through each provider"
          colorful
          formatValue={formatKobo}
          items={data.payments.by_gateway.map((g) => ({
            label: g.label,
            value: g.volume_kobo,
            sublabel: `${g.successful} of ${g.attempts} attempts succeeded`,
          }))}
          emptyMessage="No payments have been taken yet."
        />
        <BarList
          title="Confirmed value by apartment size"
          caption="Per-visit value of confirmed, assigned, in-progress and completed bookings"
          colorful
          formatValue={formatKobo}
          items={data.revenue.by_apartment.map((a) => ({
            label: a.label,
            value: a.value_kobo,
            sublabel: `${a.bookings} bookings`,
          }))}
          emptyMessage="No confirmed bookings yet."
        />
      </div>

      <CompositionBar
        title="Transaction outcomes"
        caption="Every payment attempt, by where it ended up"
        segments={[
          { key: "successful", label: "Successful", value: data.payments.this_month_count, color: STATUS.good },
          { key: "failed", label: "Failed", value: data.payments.failed, color: STATUS.critical },
          { key: "abandoned", label: "Abandoned", value: data.payments.abandoned, color: STATUS.warning },
          { key: "refunded", label: "Refunded", value: data.payments.refunded, color: STATUS.neutral },
          { key: "pending", label: "Awaiting review", value: data.payments.awaiting_manual_review, color: CATEGORICAL[2] },
        ]}
      />
    </div>
  );
}

/* ---------------------------------------------------------------- people */

function PeopleTab({ data }) {
  const { customers, cleaners, recurring } = data;

  return (
    <div className="grid gap-4">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricTile label="Customers" value={customers.total} />
        <MetricTile
          label="New this month"
          value={customers.new_this_month}
          hint={`${customers.new_this_week} this week`}
        />
        <MetricTile
          label="Repeat rate"
          value={formatPercent(customers.repeat_rate_percent)}
          hint={`${customers.repeat_customers} have booked more than once`}
        />
        <MetricTile
          label="Average lifetime value"
          value={formatKobo(customers.average_lifetime_value_kobo)}
          hint={`${customers.average_bookings_per_customer} bookings per customer on average`}
        />
        <MetricTile
          label="Active cleaners"
          value={cleaners.active_total}
          hint={`${cleaners.roster_total} on the roster in total`}
        />
        <MetricTile
          label="Utilisation"
          value={formatPercent(cleaners.utilisation_percent)}
          hint={`${cleaners.idle_active} active cleaners have no jobs`}
        />
        <MetricTile
          label="Jobs per active cleaner"
          value={cleaners.average_jobs_per_active_cleaner}
        />
        <MetricTile
          label="Applications waiting"
          value={cleaners.pending_applications}
          hint="Submitted, under review, or awaiting more info"
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <section className="rounded-2xl border border-mist bg-white/70 p-5">
          <header className="mb-4">
            <h3 className="font-display text-lg text-ink">Highest-value customers</h3>
            <p className="mt-0.5 text-xs text-ink/45">By lifetime spend</p>
          </header>
          {customers.top_by_value.length === 0 ? (
            <p className="py-6 text-center text-sm text-ink/40">No customer spend recorded yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-mist">
                    <th className="pb-2 text-xs text-ink/45">
                      Customer
                    </th>
                    <th className="pb-2 text-right text-xs text-ink/45">
                      Bookings
                    </th>
                    <th className="pb-2 text-right text-xs text-ink/45">
                      Lifetime
                    </th>
                    <th className="pb-2 text-right text-xs text-ink/45">
                      Last seen
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {customers.top_by_value.map((c) => (
                    <tr key={c.id} className="border-b border-mist/60 last:border-0">
                      <td className="py-2.5 text-ink/80">{c.name || "—"}</td>
                      <td className="py-2.5 text-right font-mono text-xs text-ink/70">{c.bookings}</td>
                      <td className="py-2.5 text-right font-mono text-xs text-ink">
                        {formatKobo(c.lifetime_spend_kobo)}
                      </td>
                      <td className="py-2.5 text-right font-mono text-xs text-ink/50">
                        {c.last_booking_at ? new Date(c.last_booking_at).toLocaleDateString() : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-mist bg-white/70 p-5">
          <header className="mb-4">
            <h3 className="font-display text-lg text-ink">Top cleaners</h3>
            <p className="mt-0.5 text-xs text-ink/45">By completed jobs, then rating</p>
          </header>
          {cleaners.top_performers.length === 0 ? (
            <p className="py-6 text-center text-sm text-ink/40">No cleaners have taken a job yet.</p>
          ) : (
            <ul className="grid gap-2.5">
              {cleaners.top_performers.map((c) => (
                <li
                  key={c.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-mist bg-linen/40 px-4 py-3"
                >
                  <span className="flex min-w-0 items-center gap-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-mist bg-linen font-display text-sm text-ink/70">
                      {c.name?.[0] || "•"}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm text-ink">{c.name}</span>
                      <span className="block text-xs text-ink/45">
                        {c.completed} completed of {c.jobs} assigned
                      </span>
                    </span>
                  </span>
                  <span className="shrink-0 text-right">
                    <span className="block font-mono text-xs text-ink">
                      {c.rating_avg ? `★ ${c.rating_avg.toFixed(1)}` : "No ratings"}
                    </span>
                    <span className="block text-xs text-ink/45">
                      {formatKobo(c.tips_kobo)} tips
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <CompositionBar
          title="Recurring plans"
          caption="How subscribers are distributed across plan states"
          segments={[
            { key: "active", label: "Active", value: recurring.active, color: STATUS.good },
            { key: "paused_user", label: "Paused by customer", value: recurring.paused_by_user, color: STATUS.warning },
            {
              key: "paused_payment",
              label: "Paused — payment failed",
              value: recurring.paused_payment_failed,
              color: STATUS.serious,
            },
            { key: "cancelled", label: "Cancelled", value: recurring.cancelled, color: STATUS.neutral },
          ]}
        />

        <section className="rounded-lg border border-mist bg-linen p-5">
          <h3 className="mb-4 font-display text-lg text-ink">Retention signals</h3>
          <dl className="grid gap-3">
            <SignalRow
              label="Booked before, but not this month"
              value={customers.returning_without_recent_booking}
              note="The win-back pool for reminders or an offer"
            />
            <SignalRow
              label="Dormant over 90 days"
              value={customers.dormant_90_days}
              note="Likely gone unless someone reaches out"
            />
            <SignalRow
              label="Opted out of marketing"
              value={customers.marketing_opted_out}
              note="Exclude these from any campaign"
            />
            <SignalRow
              label="Never booked"
              value={customers.total - customers.with_a_booking}
              note="Signed up but never completed a booking"
            />
          </dl>
        </section>
      </div>
    </div>
  );
}

function SignalRow({ label, value, note }) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-md border border-mist bg-paper px-4 py-3">
      <div className="min-w-0">
        <dt className="text-sm text-ink/75">{label}</dt>
        <dd className="mt-0.5 text-xs text-ink/50">{note}</dd>
      </div>
      <span className="shrink-0 font-display text-xl text-ink">{value}</span>
    </div>
  );
}

/* --------------------------------------------------------------- service */

function ServiceTab({ data }) {
  const { quality, support, safety, analytics } = data;

  return (
    <div className="grid gap-4">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricTile
          label="Average rating"
          value={quality.average_rating ? `★ ${quality.average_rating}` : "No ratings yet"}
          hint={`From ${quality.reviews_total} reviews`}
        />
        <MetricTile
          label="Review rate"
          value={formatPercent(quality.review_rate_percent)}
          hint="Share of completed cleans that got reviewed"
        />
        <MetricTile
          label="Completion rate"
          value={formatPercent(analytics.completion_rate_percent)}
        />
        <MetricTile
          label="Cancellation rate"
          value={formatPercent(analytics.cancellation_rate_percent)}
          tone={analytics.cancellation_rate_percent > 15 ? "urgent" : "default"}
        />
        <MetricTile
          label="Tip rate"
          value={formatPercent(quality.tip_rate_percent)}
          hint={`${quality.tipped_jobs} jobs have been tipped`}
        />
        <MetricTile
          label="Average job length"
          value={quality.average_job_minutes ? `${quality.average_job_minutes} min` : "—"}
          hint="Arrival to completion"
        />
        <MetricTile
          label="Open tickets"
          value={support.open_tickets}
          hint={`Oldest has been open ${support.oldest_open_days} days`}
          tone={support.oldest_open_days > 2 ? "urgent" : "default"}
        />
        <MetricTile
          label="Average resolution"
          value={support.average_resolution_hours !== null ? `${support.average_resolution_hours} h` : "—"}
          hint={`${support.resolved_tickets} tickets resolved`}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <BarList
          title="Rating distribution"
          caption={`${quality.with_comment} reviews came with written feedback`}
          items={quality.rating_distribution.map((r) => ({
            label: `${"★".repeat(r.rating)}${"☆".repeat(5 - r.rating)}`,
            value: r.count,
          }))}
          emptyMessage="No reviews submitted yet."
        />
        <BarList
          title="Where support tickets come from"
          caption={`${support.opened_this_month} opened this month`}
          colorful
          items={support.by_source.map((s) => ({ label: s.label, value: s.count }))}
          emptyMessage="No tickets have been opened."
        />
      </div>

      <section className="rounded-2xl border border-mist bg-white/70 p-5">
        <header className="mb-4">
          <h3 className="font-display text-lg text-ink">Field safety</h3>
          <p className="mt-0.5 text-xs text-ink/45">
            Every visit carries a safe-word check-in. A missed one escalates automatically.
          </p>
        </header>
        <div className="grid gap-3 sm:grid-cols-4">
          <SafetyStat label="Escalated alerts" value={safety.active_alerts} urgent={safety.active_alerts > 0} />
          <SafetyStat label="Check-ins pending" value={safety.checkins_pending} />
          <SafetyStat label="Check-ins cleared" value={safety.checkins_ok} />
          <SafetyStat
            label="Safe word confirmed"
            value={formatPercent(safety.safe_word_confirmed_rate_percent)}
          />
        </div>
      </section>
    </div>
  );
}

function SafetyStat({ label, value, urgent = false }) {
  return (
    <div
      className={"rounded-xl border p-4 " + (urgent ? "border-clay/40 bg-clay/[0.06]" : "border-mist bg-linen/40")
      }
    >
      <p className="mb-1 text-xs text-ink/45">{label}</p>
      <p className={"font-display text-xl " + (urgent ? "text-clay" : "text-ink")}>{value}</p>
    </div>
  );
}

/* ----------------------------------------------------------------- misc */

function QuickLink({ to, children, primary = false }) {
  return (
    <Link
      to={to}
      className={"rounded-md px-5 py-2.5 text-sm font-medium transition-colors " +
        (primary
          ? "bg-pine text-linen hover:bg-pine-light"
          : "border border-mist bg-white/70 text-ink/70 hover:border-pine hover:text-pine")
      }
    >
      {children}
    </Link>
  );
}

function DashboardSkeleton() {
  return (
    <div className="mx-auto max-w-[1400px] px-6 py-8 lg:px-10 lg:py-10">
      <div className="h-56 animate-pulse rounded-xl bg-mist/40" />
      <div className="mt-6 grid gap-3 sm:grid-cols-3 xl:grid-cols-6">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="h-20 animate-pulse rounded-2xl bg-mist/30" />
        ))}
      </div>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 8 }, (_, i) => (
          <div key={i} className="h-28 animate-pulse rounded-2xl bg-mist/25" />
        ))}
      </div>
    </div>
  );
}

function percentChange(previous, current) {
  if (!previous) return current > 0 ? 100 : null;
  return ((current - previous) / previous) * 100;
}

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import BarList from "../components/BarList";
import MetricTile from "../components/MetricTile";
import TrendChart from "../components/TrendChart";
import { fetchSupportOverview } from "../lib/api";
import { INK, formatPercent } from "../lib/chartTheme";

export default function SupportOverview() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchSupportOverview()
      .then(setData)
      .catch((err) => setError(err.message || "Could not load the support overview."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-6 py-10 lg:px-10">
        <div className="h-40 animate-pulse rounded-xl bg-mist/40" />
        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 8 }, (_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-2xl bg-mist/25" />
          ))}
        </div>
      </div>
    );
  }

  if (error) return <div className="px-8 py-16 text-clay">{error}</div>;
  if (!data) return null;

  const netChange = data.opened_this_week - data.resolved_this_week;

  return (
    <div className="mx-auto max-w-6xl px-6 py-8 lg:px-10 lg:py-10">
      <section className="relative overflow-hidden rounded-xl border border-mist gradient-brand p-7 lg:p-9">
        <div className="relative grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
          <div>
            <p className="mb-3 text-xs text-pine/65">
              Support console
            </p>
            <h1 className="mb-4 font-display text-3xl leading-tight text-ink lg:text-5xl">
              The queue, and whether it's getting better.
            </h1>
            <p className="max-w-2xl leading-relaxed text-ink/65">
              {netChange > 0
                ? `The backlog grew by ${netChange} tickets this week — more came in than went out.`
                : netChange < 0
                ? `The backlog shrank by ${Math.abs(netChange)} tickets this week. Keep going.`
                : "Opened and resolved are level this week — the queue is holding steady."}
            </p>
          </div>

          <Link
            to="/support/console"
            className="inline-flex w-fit items-center gap-2 rounded-md bg-pine px-7 py-3.5 text-sm font-medium text-linen transition-all duration-300 hover:-translate-y-0.5 hover:bg-pine-light"
          >
            Work the queue
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </section>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricTile
          label="Open tickets"
          value={data.open_tickets}
          tone={data.stale_over_72h > 0 ? "urgent" : "default"}
          hint={`${data.stale_over_24h} older than a day`}
        />
        <MetricTile
          label="Oldest open ticket"
          value={data.oldest_open_hours ? `${data.oldest_open_hours} h` : "—"}
          tone={data.oldest_open_hours > 72 ? "urgent" : "default"}
          hint={`Average age ${data.average_open_age_hours} h`}
        />
        <MetricTile
          label="Resolved today"
          value={data.resolved_today}
          hint={`${data.resolved_this_week} this week`}
        />
        <MetricTile
          label="Average resolution"
          value={data.average_resolution_hours !== null ? `${data.average_resolution_hours} h` : "—"}
          hint={`${data.resolved_total} resolved all-time`}
        />
        <MetricTile label="Opened today" value={data.opened_today} />
        <MetricTile
          label="Opened this week"
          value={data.opened_this_week}
          hint={`${data.opened_this_month} this month`}
        />
        <MetricTile
          label="Resolution rate"
          value={formatPercent(data.resolution_rate_percent)}
          hint="Share of all tickets ever closed"
        />
        <MetricTile
          label="Stale over 72h"
          value={data.stale_over_72h}
          tone={data.stale_over_72h > 0 ? "urgent" : "default"}
          hint="These need a reply before anything else"
        />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-2">
        <TrendChart
          title="Tickets opened — last 14 days"
          data={data.daily.map((d) => ({ date: d.date, value: d.opened }))}
            color={INK}
        />
        <TrendChart
          title="Tickets resolved — last 14 days"
          data={data.daily.map((d) => ({ date: d.date, value: d.resolved }))}
            color={INK}
        />
      </div>

      <div className="mt-4">
        <BarList
          title="Where tickets come from"
          caption="Total raised through each entry point, with the open share called out"
          colorful
          items={data.by_source.map((s) => ({
            label: s.label,
            value: s.count,
            sublabel: `${s.open} still open`,
          }))}
          emptyMessage="No tickets have been raised yet."
        />
      </div>

    </div>
  );
}

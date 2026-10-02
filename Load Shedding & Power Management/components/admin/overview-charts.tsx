"use client";

import { BarChart } from "@/components/charts/bar-chart";
import { ChartCard } from "@/components/charts/chart-card";
import { TrendChart } from "@/components/charts/trend-chart";
import { EmptyState } from "@/components/shared/empty-state";
import { fillMonths, monthLabel, monthTick } from "@/lib/charts";
import { formatMinutes, formatNumber, humanize } from "@/lib/format";
import { OUTAGE_STATUSES, type DashboardStats, type LoadSheddingAnalytics, type OutageAnalytics } from "@/types/domain";

const noData = (text: string) => <EmptyState title="No data yet" description={text} className="border-0 bg-transparent py-8" />;

export function OverviewCharts({
  stats,
  outages,
  shedding,
}: {
  stats: DashboardStats;
  outages: OutageAnalytics;
  shedding: LoadSheddingAnalytics;
}) {
  // The API returns the trend newest-first; charts read left-to-right.
  const trend = fillMonths([...outages.monthlyTrend].reverse(), 12, (month) => ({
    month,
    outages: 0,
    averageDowntimeMinutes: 0,
  }));
  const hasTrend = outages.monthlyTrend.length > 0;

  const byStatus = OUTAGE_STATUSES.map((status) => ({
    status: humanize(status),
    count: stats.outages.byStatus[status] ?? 0,
  }));

  const byZone = shedding.byZone.map((row) => ({ zone: row.zone, hours: Number(row.totalHours.toFixed(1)) }));

  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <ChartCard
        className="xl:col-span-2"
        title="Outages reported per month"
        description="Last 12 months, all zones"
        table={{
          columns: ["Month", "Outages", "Avg. downtime"],
          rows: hasTrend
            ? trend.map((row) => [monthLabel(row.month), row.outages, row.outages ? formatMinutes(row.averageDowntimeMinutes) : "—"])
            : [],
        }}
        empty={noData("Outage history will build up here month by month.")}
      >
        <TrendChart
          data={trend}
          xKey="month"
          series={[{ key: "outages", label: "Outages reported", color: "var(--chart-2)" }]}
          formatX={monthTick}
        />
      </ChartCard>

      <ChartCard
        title="Outages by status"
        description="Every outage on record"
        table={{ columns: ["Status", "Outages"], rows: byStatus.map((row) => [row.status, row.count]) }}
      >
        <BarChart data={byStatus} categoryKey="status" valueKey="count" label="Outages" orientation="horizontal" color="var(--chart-2)" />
      </ChartCard>

      <ChartCard
        title="Load-shedding hours by zone"
        description={`${formatNumber(shedding.criticalAreasProtected)} critical areas are always protected`}
        table={{ columns: ["Zone", "Hours shed"], rows: byZone.map((row) => [row.zone, row.hours]) }}
        empty={noData("Shedding hours appear once schedules are published.")}
      >
        <BarChart
          data={byZone}
          categoryKey="zone"
          valueKey="hours"
          label="Hours shed"
          orientation="horizontal"
          color="var(--chart-1)"
          formatValue={(value) => `${formatNumber(value, 1)}h`}
        />
      </ChartCard>
    </div>
  );
}

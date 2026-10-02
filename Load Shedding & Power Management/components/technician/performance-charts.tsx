"use client";

import { BarChart } from "@/components/charts/bar-chart";
import { ChartCard } from "@/components/charts/chart-card";
import { TrendChart } from "@/components/charts/trend-chart";
import { EmptyState } from "@/components/shared/empty-state";
import { fillMonths, monthLabel, monthTick } from "@/lib/charts";
import { formatMinutes, humanize } from "@/lib/format";
import { OUTAGE_SEVERITIES, type MyPerformance } from "@/types/domain";

/** Charts for the technician's own analytics page. */
export function PerformanceCharts({ performance }: { performance: MyPerformance }) {
  const monthly = fillMonths(performance.monthlyTrend, 12, (month) => ({ month, jobs: 0, averageMinutes: 0 }));
  const severity = OUTAGE_SEVERITIES.map((level) => ({
    severity: humanize(level),
    jobs: performance.bySeverity[level] ?? 0,
  }));

  const noJobs = performance.restoration.jobsRestored === 0;
  const empty = (
    <EmptyState
      title="No restorations yet"
      description="Your trend will appear once you've restored your first outage."
      className="border-0 bg-transparent py-8"
    />
  );

  return (
    <div className="grid gap-6 xl:grid-cols-5">
      <ChartCard
        className="xl:col-span-3"
        title="Jobs restored per month"
        description="Last 12 months"
        table={{
          columns: ["Month", "Jobs restored", "Avg. restoration"],
          rows: noJobs ? [] : monthly.map((row) => [monthLabel(row.month), row.jobs, row.jobs ? formatMinutes(row.averageMinutes) : "—"]),
        }}
        empty={empty}
      >
        <TrendChart
          data={monthly}
          xKey="month"
          series={[{ key: "jobs", label: "Jobs restored", color: "var(--chart-2)" }]}
          formatX={monthTick}
        />
      </ChartCard>

      <ChartCard
        className="xl:col-span-2"
        title="Restored jobs by severity"
        description="How serious the outages you fixed were"
        table={{ columns: ["Severity", "Jobs"], rows: noJobs ? [] : severity.map((row) => [row.severity, row.jobs]) }}
        empty={empty}
      >
        <BarChart data={severity} categoryKey="severity" valueKey="jobs" label="Jobs" color="var(--chart-2)" orientation="horizontal" />
      </ChartCard>
    </div>
  );
}

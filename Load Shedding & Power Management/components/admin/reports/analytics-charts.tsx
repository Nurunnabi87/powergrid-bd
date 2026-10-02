"use client";

import { BarChart } from "@/components/charts/bar-chart";
import { ChartCard } from "@/components/charts/chart-card";
import { EmptyState } from "@/components/shared/empty-state";
import { formatMinutes, formatNumber, humanize } from "@/lib/format";
import {
  OUTAGE_SEVERITIES,
  type LoadSheddingAnalytics,
  type OutageAnalytics,
  type TechnicianPerformanceRow,
} from "@/types/domain";

const none = (text: string) => <EmptyState title="Nothing in this range" description={text} className="border-0 bg-transparent py-8" />;

export function AnalyticsCharts({
  outages,
  shedding,
  technicians,
}: {
  outages: OutageAnalytics;
  shedding: LoadSheddingAnalytics;
  technicians: TechnicianPerformanceRow[];
}) {
  const severity = OUTAGE_SEVERITIES.map((level) => ({ severity: humanize(level), outages: outages.bySeverity[level] ?? 0 }));
  const areas = outages.topAffectedAreas.map((area) => ({ area: area.area, outages: area.outages }));
  const feeders = shedding.mostShedFeeders.map((feeder) => ({ feeder: feeder.feeder, hours: Number(feeder.totalHours.toFixed(1)) }));
  const leaderboard = technicians.map((tech) => ({ technician: tech.technician, jobs: tech.jobsCompleted }));

  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <ChartCard
        title="Outages by severity"
        description="Reported in the selected range"
        table={{ columns: ["Severity", "Outages"], rows: outages.totalOutages ? severity.map((row) => [row.severity, row.outages]) : [] }}
        empty={none("No outages were reported in this range.")}
      >
        <BarChart data={severity} categoryKey="severity" valueKey="outages" label="Outages" color="var(--chart-2)" />
      </ChartCard>

      <ChartCard
        title="Most affected areas"
        description="Top 5 by outage count, with average downtime in the table"
        table={{
          columns: ["Area", "Zone", "Outages", "Avg. downtime"],
          rows: outages.topAffectedAreas.map((area) => [area.area, area.zone, area.outages, formatMinutes(area.averageDowntimeMinutes)]),
        }}
        empty={none("No area had an outage in this range.")}
      >
        <BarChart data={areas} categoryKey="area" valueKey="outages" label="Outages" orientation="horizontal" color="var(--chart-2)" />
      </ChartCard>

      <ChartCard
        title="Most shed feeders"
        description="All-time load-shedding hours (top 10)"
        table={{
          columns: ["Feeder", "Code", "Slots", "Hours"],
          rows: shedding.mostShedFeeders.map((feeder) => [feeder.feeder, feeder.code, feeder.slots, formatNumber(feeder.totalHours, 1)]),
        }}
        empty={none("No feeder has been shed yet.")}
      >
        <BarChart
          data={feeders}
          categoryKey="feeder"
          valueKey="hours"
          label="Hours shed"
          orientation="horizontal"
          color="var(--chart-1)"
          formatValue={(value) => `${formatNumber(value, 1)}h`}
        />
      </ChartCard>

      <ChartCard
        title="Technician leaderboard"
        description="Completed jobs, with average restoration time in the table"
        table={{
          columns: ["Technician", "Jobs completed", "Avg. restoration"],
          rows: technicians.map((tech) => [tech.technician, tech.jobsCompleted, formatMinutes(tech.averageRestorationMinutes)]),
        }}
        empty={none("No technician has completed a job yet.")}
      >
        <BarChart data={leaderboard} categoryKey="technician" valueKey="jobs" label="Jobs completed" orientation="horizontal" color="var(--chart-3)" />
      </ChartCard>
    </div>
  );
}

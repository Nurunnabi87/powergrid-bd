import type { Metadata } from "next";
import { Gauge, Timer, TimerOff, TimerReset, Users, Wrench } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { PerformanceCharts } from "@/components/technician/performance-charts";
import { apiGet } from "@/lib/api/server";
import { formatMinutes, formatNumber } from "@/lib/format";
import type { MyPerformance } from "@/types/domain";

export const metadata: Metadata = { title: "Performance" };

export default async function TechnicianPerformancePage() {
  const performance = await apiGet<MyPerformance>("/analytics/my-performance");
  const { restoration, assignments, profile } = performance;

  return (
    <>
      <PageHeader
        title="My performance"
        description={`Your restoration record as ${profile.specialization}${profile.zone ? ` in ${profile.zone.name}` : ""}.`}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard label="Jobs restored" value={formatNumber(restoration.jobsRestored)} icon={Wrench} accent="success" hint={`${assignments.total} assignments in total`} />
        <StatCard label="Customers restored" value={formatNumber(restoration.customersRestored)} icon={Users} accent="primary" hint="Across all completed jobs" />
        <StatCard label="Currently active" value={`${profile.activeJobCount} / ${profile.maxConcurrentJobs}`} icon={Gauge} accent="info" hint="Jobs in hand vs. capacity" />
        <StatCard label="Average restoration" value={formatMinutes(restoration.averageMinutes)} icon={Timer} accent="info" hint="Report to power back" />
        <StatCard label="Fastest restoration" value={formatMinutes(restoration.fastestMinutes)} icon={TimerReset} accent="success" />
        <StatCard label="Longest restoration" value={formatMinutes(restoration.slowestMinutes)} icon={TimerOff} accent="warning" />
      </div>

      <PerformanceCharts performance={performance} />
    </>
  );
}

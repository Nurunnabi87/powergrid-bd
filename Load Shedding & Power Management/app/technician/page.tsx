import type { Metadata } from "next";
import Link from "next/link";
import { Activity, CircleCheck, Gauge, Power } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PrefetchOutages } from "@/components/outages/prefetch-outages";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { TechnicianJobList } from "@/components/technician/technician-job-list";
import { apiGet } from "@/lib/api/server";
import { formatMinutes } from "@/lib/format";
import type { MyPerformance } from "@/types/domain";

export const metadata: Metadata = { title: "My jobs" };

export default async function TechnicianJobsPage({ searchParams }: PageProps<"/technician">) {
  const [performance, params] = await Promise.all([apiGet<MyPerformance>("/analytics/my-performance"), searchParams]);
  const { profile, assignments, restoration } = performance;
  const atCapacity = profile.activeJobCount >= profile.maxConcurrentJobs;

  return (
    <>
      <PageHeader
        title="My jobs"
        description="Outages dispatched to you. Start work when you reach the site, then confirm when power is restored."
        actions={
          <Button variant="outline" asChild>
            <Link href="/technician/profile">
              <Power className={profile.isAvailable ? "text-success" : "text-muted-foreground"} />
              {profile.isAvailable ? "Available for dispatch" : "Unavailable"}
            </Link>
          </Button>
        }
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Active jobs"
          value={`${profile.activeJobCount} / ${profile.maxConcurrentJobs}`}
          icon={Gauge}
          accent={atCapacity ? "danger" : "primary"}
          hint={atCapacity ? "At capacity — no new dispatches" : "Current workload"}
        />
        <StatCard label="Awaiting start" value={assignments.ASSIGNED} icon={Activity} accent="warning" hint="Assigned, not yet started" />
        <StatCard label="Jobs restored" value={restoration.jobsRestored} icon={CircleCheck} accent="success" hint="All time" />
        <StatCard
          label="Avg. restoration"
          value={formatMinutes(restoration.averageMinutes)}
          icon={Power}
          accent="info"
          hint={profile.zone ? `${profile.zone.name} zone` : "All zones"}
        />
      </div>
      <PrefetchOutages scope="assigned" searchParams={params}>
        <TechnicianJobList />
      </PrefetchOutages>
    </>
  );
}

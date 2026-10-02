import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Banknote,
  CalendarClock,
  CircleCheck,
  Network,
  Receipt,
  Timer,
  TriangleAlert,
  Users,
  Wand2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { OverviewCharts } from "@/components/admin/overview-charts";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { apiGet, apiList } from "@/lib/api/server";
import { formatBDT, formatMinutes, formatNumber, formatRelative } from "@/lib/format";
import type { DashboardStats, LoadSheddingAnalytics, Outage, OutageAnalytics } from "@/types/domain";

export const metadata: Metadata = { title: "Overview" };

export default async function AdminOverviewPage() {
  const [stats, outages, shedding, newReports] = await Promise.all([
    apiGet<DashboardStats>("/admin/dashboard-stats"),
    apiGet<OutageAnalytics>("/analytics/outages"),
    apiGet<LoadSheddingAnalytics>("/analytics/load-shedding"),
    apiList<Outage>("/outages", { query: { status: "REPORTED", limit: 5, sortBy: "reportedAt" } }),
  ]);

  const customers = stats.users.CUSTOMER ?? 0;
  const technicians = stats.users.TECHNICIAN ?? 0;
  const overdue = stats.billing.byStatus.OVERDUE;

  return (
    <>
      <PageHeader
        title="Grid operations overview"
        description={`Live position across ${stats.infrastructure.zones} zones, ${stats.infrastructure.feeders} feeders and ${formatNumber(stats.infrastructure.connections)} connections.`}
        actions={
          <Button asChild>
            <Link href="/admin/schedules/generate">
              <Wand2 /> Generate schedule
            </Link>
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Open outages"
          value={stats.outages.currentlyOpen}
          icon={TriangleAlert}
          accent={stats.outages.currentlyOpen ? "warning" : "success"}
          hint={`${stats.outages.byStatus.REPORTED ?? 0} awaiting acknowledgement`}
        />
        <StatCard
          label="Avg. restoration"
          value={formatMinutes(stats.outages.averageRestorationMinutes)}
          icon={Timer}
          accent="info"
          hint={`${outages.resolutionRate}% of outages resolved`}
        />
        <StatCard
          label="Shedding right now"
          value={stats.loadShedding.activeSchedules}
          icon={CalendarClock}
          accent="primary"
          hint="Active load-shedding slots"
        />
        <StatCard
          label="Revenue collected"
          value={formatBDT(stats.revenue.totalCollected)}
          icon={Banknote}
          accent="success"
          hint={`${stats.revenue.completedPayments} completed payments`}
        />
        <StatCard
          label="Outstanding bills"
          value={formatBDT(stats.billing.unpaidAmount)}
          icon={Receipt}
          accent={overdue?.count ? "danger" : "warning"}
          hint={overdue?.count ? `${overdue.count} overdue (${formatBDT(overdue.amount)})` : "Nothing overdue"}
        />
        <StatCard label="Customers" value={formatNumber(customers)} icon={Users} accent="info" hint={`${technicians} field technicians`} />
        <StatCard
          label="Network"
          value={`${stats.infrastructure.substations} / ${stats.infrastructure.feeders}`}
          icon={Network}
          accent="primary"
          hint={`Substations / feeders · ${stats.infrastructure.areas} areas`}
        />
        <StatCard
          label="Resolved outages"
          value={outages.resolvedOutages}
          icon={CircleCheck}
          accent="success"
          hint={`of ${outages.totalOutages} reported in total`}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Needs attention</CardTitle>
          <CardDescription>New outage reports waiting for acknowledgement</CardDescription>
          <CardAction>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/admin/outages?status=REPORTED">
                Open queue <ArrowRight />
              </Link>
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent>
          {newReports.data.length === 0 ? (
            <EmptyState icon={CircleCheck} title="Queue is clear" description="Every report has been picked up." className="border-0 bg-transparent py-6" />
          ) : (
            <ul className="divide-y">
              {newReports.data.map((outage) => (
                <li key={outage.id}>
                  <Link href={`/admin/outages/${outage.id}`} className="flex flex-wrap items-center justify-between gap-3 py-3 hover:bg-muted/40 sm:px-2">
                    <div className="min-w-0">
                      <p className="truncate font-medium">{outage.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {outage.area.name} · {formatNumber(outage.affectedCustomers)} customers · {formatRelative(outage.reportedAt)}
                      </p>
                    </div>
                    <StatusBadge status={outage.severity} kind="scale" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <OverviewCharts stats={stats} outages={outages} shedding={shedding} />
    </>
  );
}

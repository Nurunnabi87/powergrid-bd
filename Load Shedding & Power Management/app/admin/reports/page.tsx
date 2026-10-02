import type { Metadata } from "next";
import { HydrationBoundary, QueryClient, dehydrate } from "@tanstack/react-query";
import { CircleCheck, Gauge, Timer, TimerOff, TimerReset, TriangleAlert } from "lucide-react";
import { AnalyticsCharts } from "@/components/admin/reports/analytics-charts";
import { AuditLogTable } from "@/components/admin/reports/audit-log-table";
import { ContactInbox } from "@/components/admin/reports/contact-inbox";
import { ReportTabs, type ReportTab } from "@/components/admin/reports/report-tabs";
import { DateFilter } from "@/components/shared/date-filter";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { apiGet, apiList } from "@/lib/api/server";
import { formatMinutes } from "@/lib/format";
import { queryKeys } from "@/lib/query/keys";
import { auditParams, contactParams, rangeParams } from "@/lib/query/report-params";
import type {
  AuditLog,
  ContactMessage,
  LoadSheddingAnalytics,
  OutageAnalytics,
  TechnicianPerformanceRow,
} from "@/types/domain";

export const metadata: Metadata = { title: "Reports" };

const TABS: ReportTab[] = ["analytics", "audit", "messages"];

async function AnalyticsTab({ query }: { query: Record<string, string | string[] | undefined> }) {
  const range = rangeParams(query);
  const [outages, shedding, technicians] = await Promise.all([
    apiGet<OutageAnalytics>("/analytics/outages", { query: range }),
    apiGet<LoadSheddingAnalytics>("/analytics/load-shedding", { query: range }),
    apiGet<TechnicianPerformanceRow[]>("/analytics/technicians"),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <span className="text-sm text-muted-foreground">Reported between</span>
        <DateFilter param="from" label="From date" />
        <span className="hidden text-sm text-muted-foreground sm:inline">and</span>
        <DateFilter param="to" label="To date" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard label="Outages reported" value={outages.totalOutages} icon={TriangleAlert} accent="warning" />
        <StatCard label="Resolution rate" value={`${outages.resolutionRate}%`} icon={CircleCheck} accent="success" hint={`${outages.resolvedOutages} resolved`} />
        <StatCard label="Mean time to restore" value={formatMinutes(outages.meanTimeToRestoreMinutes)} icon={Timer} accent="info" />
        <StatCard label="Fastest restoration" value={formatMinutes(outages.fastestRestorationMinutes)} icon={TimerReset} accent="success" />
        <StatCard label="Slowest restoration" value={formatMinutes(outages.slowestRestorationMinutes)} icon={TimerOff} accent="danger" />
        <StatCard label="Critical areas protected" value={shedding.criticalAreasProtected} icon={Gauge} accent="primary" hint="Never included in shedding" />
      </div>
      <AnalyticsCharts outages={outages} shedding={shedding} technicians={technicians} />
    </div>
  );
}

export default async function AdminReportsPage({ searchParams }: PageProps<"/admin/reports">) {
  const query = await searchParams;
  const tab: ReportTab = TABS.includes(query.tab as ReportTab) ? (query.tab as ReportTab) : "analytics";

  let content;
  if (tab === "analytics") {
    content = <AnalyticsTab query={query} />;
  } else {
    const queryClient = new QueryClient();
    if (tab === "audit") {
      const params = auditParams(query);
      await queryClient.prefetchQuery({
        queryKey: queryKeys.admin.auditLogs(params),
        queryFn: () => apiList<AuditLog>("/admin/audit-logs", { query: params }),
      });
    } else {
      const params = contactParams(query);
      await queryClient.prefetchQuery({
        queryKey: queryKeys.admin.contactMessages(params),
        queryFn: () => apiList<ContactMessage>("/admin/contact-messages", { query: params }),
      });
    }
    content = (
      <HydrationBoundary state={dehydrate(queryClient)}>{tab === "audit" ? <AuditLogTable /> : <ContactInbox />}</HydrationBoundary>
    );
  }

  return (
    <>
      <PageHeader
        title="Reports & audit"
        description="Restoration performance, load-shedding history, the full audit trail and messages from the public."
      />
      <ReportTabs tab={tab}>{content}</ReportTabs>
    </>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  CalendarClock,
  CircleCheck,
  Gauge,
  Plus,
  Receipt,
  TriangleAlert,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { OutageProgress } from "@/components/outages/outage-timeline";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { WelcomeToast } from "@/components/shared/welcome-toast";
import { apiGet, apiList } from "@/lib/api/server";
import { getSession } from "@/lib/auth/session";
import { formatBDT, formatCalendarDate, formatDate, formatRelative, formatTime } from "@/lib/format";
import type { Bill, MyConnection, Outage, Schedule } from "@/types/domain";

export const metadata: Metadata = { title: "Overview" };

const OPEN_STATUSES = new Set(["REPORTED", "ACKNOWLEDGED", "ASSIGNED", "IN_PROGRESS"]);

export default async function CustomerOverviewPage({ searchParams }: PageProps<"/dashboard">) {
  const { welcome } = await searchParams;

  // Independent requests run in parallel; the layout's session is cached.
  const [user, schedules, reports, bills, connections] = await Promise.all([
    getSession(),
    apiGet<Schedule[]>("/schedules/my"),
    apiList<Outage>("/outages/my-reports", { query: { limit: 4, sortBy: "reportedAt" } }),
    apiList<Bill>("/bills/my", { query: { limit: 100 } }),
    apiGet<MyConnection[]>("/users/me/connections"),
  ]);

  const unpaid = bills.data.filter((bill) => bill.status !== "PAID");
  const outstanding = unpaid.reduce((sum, bill) => sum + bill.totalAmount, 0);
  const overdue = unpaid.filter((bill) => bill.status === "OVERDUE").length;
  const openReports = reports.data.filter((report) => OPEN_STATUSES.has(report.status)).length;
  const nextSlot = schedules[0];
  const firstName = user?.name.split(" ")[0] ?? "there";

  return (
    <>
      {welcome && <WelcomeToast message="Welcome to PowerGrid BD! Your account is ready." />}
      <PageHeader
        title={`Hello, ${firstName}`}
        description="Your supply at a glance: upcoming load shedding, your outage reports and your bills."
        actions={
          <Button asChild>
            <Link href="/dashboard/outages/new">
              <Plus /> Report an outage
            </Link>
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Outstanding balance"
          value={formatBDT(outstanding)}
          icon={Receipt}
          accent={overdue ? "danger" : outstanding ? "warning" : "success"}
          hint={overdue ? `${overdue} overdue bill${overdue > 1 ? "s" : ""} with late fee` : `${unpaid.length} unpaid bill(s)`}
        />
        <StatCard
          label="Next load shedding"
          value={nextSlot ? formatTime(nextSlot.startTime) : "None"}
          icon={CalendarClock}
          accent="info"
          hint={nextSlot ? `${formatCalendarDate(nextSlot.date)} · ${nextSlot.feeder.name}` : "No slots scheduled for your feeders"}
        />
        <StatCard
          label="Open outage reports"
          value={openReports}
          icon={TriangleAlert}
          accent={openReports ? "warning" : "success"}
          hint={`${reports.meta.total} reported in total`}
        />
        <StatCard
          label="Your meters"
          value={connections.length}
          icon={Gauge}
          accent="primary"
          hint={connections.map((c) => c.meterNo).join(", ") || "No meters linked yet"}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Upcoming load shedding</CardTitle>
            <CardDescription>Slots on the feeders that supply your meters</CardDescription>
            <CardAction>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/dashboard/schedule">
                  View all <ArrowRight />
                </Link>
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent>
            {schedules.length === 0 ? (
              <EmptyState
                icon={Zap}
                title="No shedding planned for your area"
                description="We'll notify you as soon as a slot is published for your feeder."
                className="border-0 bg-transparent py-6"
              />
            ) : (
              <ul className="divide-y">
                {schedules.slice(0, 5).map((slot) => (
                  <li key={slot.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                    <div className="min-w-0">
                      <p className="font-medium tabular-nums">
                        {formatTime(slot.startTime)} – {formatTime(slot.endTime)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {formatCalendarDate(slot.date)} · {slot.feeder.name}
                      </p>
                    </div>
                    <StatusBadge status={slot.status} label={slot.status === "ACTIVE" ? "Shedding now" : undefined} />
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent reports</CardTitle>
            <CardDescription>Outages you have reported</CardDescription>
            <CardAction>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/dashboard/outages">
                  All <ArrowRight />
                </Link>
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent>
            {reports.data.length === 0 ? (
              <EmptyState
                icon={CircleCheck}
                title="No outages reported"
                description="If your power goes out unexpectedly, report it here."
                className="border-0 bg-transparent py-6"
              />
            ) : (
              <ul className="space-y-3">
                {reports.data.map((report) => (
                  <li key={report.id}>
                    <Link
                      href={`/dashboard/outages/${report.id}`}
                      className="block space-y-2 rounded-lg border p-3 transition-colors hover:bg-muted/50"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="line-clamp-1 font-medium">{report.title}</p>
                        <StatusBadge status={report.status} />
                      </div>
                      <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                        <span>
                          {report.area.name} · {formatRelative(report.reportedAt)}
                        </span>
                        <OutageProgress status={report.status} />
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      {unpaid.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Bills to pay</CardTitle>
            <CardDescription>Pay securely by card or bKash</CardDescription>
            <CardAction>
              <Button size="sm" asChild>
                <Link href="/dashboard/bills">Pay bills</Link>
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent>
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {unpaid.slice(0, 3).map((bill) => (
                <li key={bill.id} className="space-y-1 rounded-lg border p-4">
                  <div className="flex items-center justify-between">
                    <p className="font-medium">{bill.connection.meterNo}</p>
                    <StatusBadge status={bill.status} />
                  </div>
                  <p className="text-xl font-semibold tabular-nums">{formatBDT(bill.totalAmount)}</p>
                  <p className="text-xs text-muted-foreground">
                    {bill.billingPeriod} · due {formatDate(bill.dueDate)}
                  </p>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { CalendarCheck, Cable, Clock, Gauge } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { apiGet } from "@/lib/api/server";
import { formatCalendarDate, formatMinutes, formatTime } from "@/lib/format";
import type { MyConnection, Schedule } from "@/types/domain";

export const metadata: Metadata = { title: "My schedule" };

const durationMinutes = (slot: Schedule) =>
  (new Date(slot.endTime).getTime() - new Date(slot.startTime).getTime()) / 60_000;

export default async function MySchedulePage() {
  const [schedules, connections] = await Promise.all([
    apiGet<Schedule[]>("/schedules/my"),
    apiGet<MyConnection[]>("/users/me/connections"),
  ]);

  // Group by calendar day, keeping the API's chronological order.
  const byDate = new Map<string, Schedule[]>();
  for (const slot of schedules) {
    const key = slot.date.slice(0, 10);
    byDate.set(key, [...(byDate.get(key) ?? []), slot]);
  }

  const totalMinutes = schedules.reduce((sum, slot) => sum + durationMinutes(slot), 0);

  return (
    <>
      <PageHeader
        title="My load-shedding schedule"
        description="Upcoming slots for the feeders that supply your meters. Times are in Bangladesh time."
        actions={
          <Button variant="outline" asChild>
            <Link href="/schedule">Network-wide schedule</Link>
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
        <div className="space-y-6">
          {schedules.length === 0 ? (
            <EmptyState
              icon={CalendarCheck}
              title="No upcoming load shedding"
              description="None of your feeders have slots scheduled. You'll get a notification when that changes."
            />
          ) : (
            [...byDate.entries()].map(([date, slots]) => (
              <section key={date} aria-labelledby={`day-${date}`} className="space-y-3">
                <h2 id={`day-${date}`} className="text-sm font-semibold text-muted-foreground">
                  {formatCalendarDate(date)}
                </h2>
                <ul className="space-y-3">
                  {slots.map((slot) => (
                    <li key={slot.id}>
                      <Card className="gap-0 py-0">
                        <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                          <div className="flex items-center gap-4">
                            <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-info/12 text-info">
                              <Clock className="size-5" aria-hidden />
                            </span>
                            <div>
                              <p className="font-mono text-lg font-semibold tabular-nums">
                                {formatTime(slot.startTime)} – {formatTime(slot.endTime)}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {slot.feeder.name} ({slot.feeder.code}) · {formatMinutes(durationMinutes(slot))}
                                {slot.reason ? ` · ${slot.reason}` : ""}
                              </p>
                            </div>
                          </div>
                          <StatusBadge status={slot.status} label={slot.status === "ACTIVE" ? "Shedding now" : undefined} />
                        </CardContent>
                      </Card>
                    </li>
                  ))}
                </ul>
              </section>
            ))
          )}
        </div>

        <aside className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Coming up</CardTitle>
              <CardDescription>Across all your meters</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-2xl font-semibold tabular-nums">{schedules.length}</p>
                <p className="text-xs text-muted-foreground">slots</p>
              </div>
              <div>
                <p className="text-2xl font-semibold tabular-nums">{formatMinutes(totalMinutes)}</p>
                <p className="text-xs text-muted-foreground">without power</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Your meters</CardTitle>
              <CardDescription>Which feeder supplies each meter</CardDescription>
            </CardHeader>
            <CardContent>
              {connections.length === 0 ? (
                <p className="text-sm text-muted-foreground">No meters are linked to your account yet.</p>
              ) : (
                <ul className="space-y-4">
                  {connections.map((connection) => (
                    <li key={connection.id} className="space-y-1.5">
                      <p className="flex items-center gap-2 font-medium">
                        <Gauge className="size-4 text-muted-foreground" aria-hidden />
                        {connection.meterNo}
                        <StatusBadge status={connection.area.priorityTier} kind="scale" className="ml-auto" />
                      </p>
                      <p className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Cable className="size-4" aria-hidden />
                        {connection.area.name} · {connection.area.feeder.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {connection.area.feeder.substation.name}, {connection.area.feeder.substation.zone.name}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </aside>
      </div>
    </>
  );
}

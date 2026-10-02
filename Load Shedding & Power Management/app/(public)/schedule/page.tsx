import type { Metadata } from "next";
import Link from "next/link";
import { CalendarCheck, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHero } from "@/components/marketing/section";
import { PublicScheduleFilters } from "@/components/schedule/public-schedule-filters";
import { PublicScheduleList } from "@/components/schedule/public-schedule-list";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { PaginationBar } from "@/components/shared/pagination-bar";
import { publicGet } from "@/lib/api/server";
import { formatCalendarDate, todayInDhaka } from "@/lib/format";
import { pickParams } from "@/lib/query/params";
import type { PublicSchedule, PublicZone } from "@/types/domain";

export const metadata: Metadata = {
  title: "Load-shedding schedule",
  description:
    "Look up today's (or any day's) published load-shedding slots by zone, feeder or neighbourhood. Critical sites like hospitals are always protected.",
  alternates: { canonical: "/schedule" },
  openGraph: {
    title: "Load-shedding schedule | PowerGrid BD",
    description: "Find out exactly when your area is scheduled for load shedding.",
  },
};

export default async function SchedulePage({ searchParams }: PageProps<"/schedule">) {
  const today = todayInDhaka();
  const params = pickParams(await searchParams, ["zoneId", "date", "search", "page"], { date: today, limit: 10 });

  const [zonesResult, schedulesResult] = await Promise.all([
    publicGet<PublicZone[]>("/public/zones", undefined, 600),
    publicGet<PublicSchedule[]>("/public/schedules", params, 60),
  ]);

  const zones = zonesResult?.data ?? [];
  const date = String(params.date);
  const isToday = date === today;

  return (
    <>
      <PageHero
        eyebrow="Load-shedding schedule"
        title="When is my area losing power?"
        description="Published shedding slots for every feeder, updated as the control room issues them. Search your neighbourhood to see exactly when it's affected."
      />

      <div className="mx-auto max-w-7xl space-y-6 px-4 py-10 sm:px-6 lg:px-8">
        <PublicScheduleFilters zones={zones} today={today} />

        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-semibold">
            {isToday ? "Today" : "Schedule"} · {formatCalendarDate(date)}
          </h2>
          <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <ShieldCheck className="size-4 text-success" aria-hidden /> Times shown in Bangladesh time (BST)
          </p>
        </div>

        {!schedulesResult ? (
          <ErrorState
            title="Schedule unavailable"
            message="We couldn't load the schedule right now. Please refresh the page in a moment."
          />
        ) : schedulesResult.data.length === 0 ? (
          <EmptyState
            icon={CalendarCheck}
            title={params.search ? `No slots match "${params.search}"` : "No load shedding scheduled"}
            description={
              params.search
                ? "That area or feeder has no shedding on this date. Check the spelling or try another date."
                : "No slots have been published for this date and zone."
            }
            action={
              !isToday ? (
                <Button variant="outline" asChild>
                  <Link href="/schedule">Show today</Link>
                </Button>
              ) : undefined
            }
          />
        ) : (
          <>
            <PublicScheduleList schedules={schedulesResult.data} />
            {schedulesResult.meta && <PaginationBar meta={schedulesResult.meta} noun="slots" />}
          </>
        )}
      </div>
    </>
  );
}

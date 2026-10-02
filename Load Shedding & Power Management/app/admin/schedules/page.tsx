import type { Metadata } from "next";
import Link from "next/link";
import { HydrationBoundary, QueryClient, dehydrate } from "@tanstack/react-query";
import { Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CreateScheduleDialog } from "@/components/admin/schedules/create-schedule-dialog";
import { ScheduleTable } from "@/components/admin/schedules/schedule-table";
import { PageHeader } from "@/components/shared/page-header";
import { zoneOptions } from "@/lib/api/options";
import { apiList } from "@/lib/api/server";
import { queryKeys } from "@/lib/query/keys";
import { scheduleParams } from "@/lib/query/schedule-params";
import type { Schedule } from "@/types/domain";

export const metadata: Metadata = { title: "Load shedding" };

export default async function AdminSchedulesPage({ searchParams }: PageProps<"/admin/schedules">) {
  const params = scheduleParams(await searchParams);
  const queryClient = new QueryClient();

  const [zones] = await Promise.all([
    zoneOptions(),
    queryClient.prefetchQuery({
      queryKey: queryKeys.schedules.list(params),
      queryFn: () => apiList<Schedule>("/schedules", { query: params }),
    }),
  ]);

  return (
    <>
      <PageHeader
        title="Load-shedding schedules"
        description="Publish slots per feeder, or generate a whole day for a zone from its supply deficit. Overlaps on a feeder are rejected."
        actions={
          <>
            <CreateScheduleDialog />
            <Button asChild>
              <Link href="/admin/schedules/generate">
                <Wand2 /> Generate schedule
              </Link>
            </Button>
          </>
        }
      />
      <HydrationBoundary state={dehydrate(queryClient)}>
        <ScheduleTable zones={zones} />
      </HydrationBoundary>
    </>
  );
}

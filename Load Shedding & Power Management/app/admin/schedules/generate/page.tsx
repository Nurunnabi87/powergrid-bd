import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GenerateScheduleWizard } from "@/components/admin/schedules/generate-schedule-wizard";
import { PageHeader } from "@/components/shared/page-header";
import { apiList } from "@/lib/api/server";
import type { Zone } from "@/types/domain";

export const metadata: Metadata = { title: "Generate schedule" };

export default async function GenerateSchedulePage() {
  const zones = await apiList<Zone>("/zones", { query: { limit: 100, sortBy: "name", sortOrder: "asc" } });

  return (
    <>
      <Button variant="ghost" size="sm" className="-ml-2 w-fit" asChild>
        <Link href="/admin/schedules">
          <ArrowLeft /> Load-shedding schedules
        </Link>
      </Button>
      <PageHeader
        title="Generate a load-shedding schedule"
        description="Enter a zone's supply deficit and the system builds a fair, priority-based rota — critical sites are always protected."
      />
      <GenerateScheduleWizard zones={zones.data} />
    </>
  );
}

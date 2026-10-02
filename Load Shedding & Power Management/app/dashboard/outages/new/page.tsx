import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ReportOutageWizard } from "@/components/outages/report-outage-wizard";
import { PageHeader } from "@/components/shared/page-header";
import { apiGet } from "@/lib/api/server";
import type { MyConnection } from "@/types/domain";

export const metadata: Metadata = { title: "Report an outage" };

export default async function ReportOutagePage() {
  // The customer's own meters are the likely locations; fetched on the
  // server so step one renders instantly.
  const connections = await apiGet<MyConnection[]>("/users/me/connections");

  return (
    <>
      <Button variant="ghost" size="sm" className="-ml-2 w-fit" asChild>
        <Link href="/dashboard/outages">
          <ArrowLeft /> Outage reports
        </Link>
      </Button>
      <PageHeader
        title="Report an outage"
        description="Tell us where the power is out and what happened. Scheduled load shedding doesn't need a report."
      />
      <ReportOutageWizard connections={connections} />
    </>
  );
}

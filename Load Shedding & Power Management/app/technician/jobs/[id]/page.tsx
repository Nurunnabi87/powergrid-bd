import type { Metadata } from "next";
import { OutageDetail } from "@/components/outages/outage-detail";
import { JobActions } from "@/components/technician/job-actions";
import { orNotFound } from "@/lib/api/not-found";
import { apiGet } from "@/lib/api/server";
import type { Outage } from "@/types/domain";

export const metadata: Metadata = { title: "Job details" };

export default async function TechnicianJobPage({ params }: PageProps<"/technician/jobs/[id]">) {
  const { id } = await params;
  const outage = await orNotFound(apiGet<Outage>(`/outages/${id}`));

  return (
    <OutageDetail outage={outage} backHref="/technician" backLabel="My jobs" actions={<JobActions outage={outage} />} />
  );
}

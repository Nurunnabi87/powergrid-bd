import type { Metadata } from "next";
import { OutageDetail } from "@/components/outages/outage-detail";
import { orNotFound } from "@/lib/api/not-found";
import { apiGet } from "@/lib/api/server";
import type { Outage } from "@/types/domain";

export const metadata: Metadata = { title: "Outage report" };

export default async function CustomerOutagePage({ params }: PageProps<"/dashboard/outages/[id]">) {
  const { id } = await params;
  // The API only returns reports this customer filed (403 otherwise → 404 here).
  const outage = await orNotFound(apiGet<Outage>(`/outages/${id}`));

  return <OutageDetail outage={outage} backHref="/dashboard/outages" backLabel="All reports" />;
}

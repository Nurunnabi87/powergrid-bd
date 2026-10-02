import type { Metadata } from "next";
import { OutageAdminActions } from "@/components/admin/outage-admin-actions";
import { OutageDetail } from "@/components/outages/outage-detail";
import { orNotFound } from "@/lib/api/not-found";
import { apiGet } from "@/lib/api/server";
import type { Outage } from "@/types/domain";

export const metadata: Metadata = { title: "Outage details" };

export default async function AdminOutagePage({ params }: PageProps<"/admin/outages/[id]">) {
  const { id } = await params;
  const outage = await orNotFound(apiGet<Outage>(`/outages/${id}`));

  return (
    <OutageDetail
      outage={outage}
      backHref="/admin/outages"
      backLabel="All outages"
      actions={<OutageAdminActions outage={outage} variant="buttons" afterDelete="/admin/outages" />}
    />
  );
}

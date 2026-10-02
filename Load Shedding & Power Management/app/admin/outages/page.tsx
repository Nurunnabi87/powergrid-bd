import type { Metadata } from "next";
import { AdminOutageList } from "@/components/admin/admin-outage-list";
import { PrefetchOutages } from "@/components/outages/prefetch-outages";
import { PageHeader } from "@/components/shared/page-header";
import { zoneOptions } from "@/lib/api/options";

export const metadata: Metadata = { title: "Outages" };

export default async function AdminOutagesPage({ searchParams }: PageProps<"/admin/outages">) {
  const [zones, params] = await Promise.all([zoneOptions(), searchParams]);

  return (
    <>
      <PageHeader
        title="Outage management"
        description="Acknowledge customer reports, dispatch technicians and close restored outages."
      />
      <PrefetchOutages scope="all" searchParams={params}>
        <AdminOutageList zones={zones} />
      </PrefetchOutages>
    </>
  );
}

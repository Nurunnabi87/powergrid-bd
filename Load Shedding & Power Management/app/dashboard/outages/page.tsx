import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CustomerOutageList } from "@/components/outages/customer-outage-list";
import { PrefetchOutages } from "@/components/outages/prefetch-outages";
import { PageHeader } from "@/components/shared/page-header";

export const metadata: Metadata = { title: "Outage reports" };

export default async function MyOutagesPage({ searchParams }: PageProps<"/dashboard/outages">) {
  return (
    <>
      <PageHeader
        title="Outage reports"
        description="Unexpected outages you've reported, and how far each one is from being restored."
        actions={
          <Button asChild>
            <Link href="/dashboard/outages/new">
              <Plus /> Report an outage
            </Link>
          </Button>
        }
      />
      <PrefetchOutages scope="mine" searchParams={await searchParams}>
        <CustomerOutageList />
      </PrefetchOutages>
    </>
  );
}

"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OutageList } from "@/components/outages/outage-list";

export function CustomerOutageList() {
  return (
    <OutageList
      scope="mine"
      basePath="/dashboard/outages"
      emptyTitle="You haven't reported any outages"
      emptyDescription="If your power goes out outside a scheduled load-shedding slot, report it so a technician can be sent."
      emptyAction={
        <Button asChild>
          <Link href="/dashboard/outages/new">
            <Plus /> Report an outage
          </Link>
        </Button>
      }
    />
  );
}

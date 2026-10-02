"use client";

import { OutageAdminActions } from "@/components/admin/outage-admin-actions";
import { OutageList } from "@/components/outages/outage-list";
import type { FilterOption } from "@/components/shared/filter-select";

export function AdminOutageList({ zones }: { zones: FilterOption[] }) {
  return (
    <OutageList
      scope="all"
      basePath="/admin/outages"
      zones={zones}
      renderActions={(outage) => <OutageAdminActions outage={outage} />}
      emptyTitle="No outages on record"
      emptyDescription="Customer outage reports will appear here for acknowledgement and dispatch."
    />
  );
}

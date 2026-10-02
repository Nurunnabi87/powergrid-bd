"use client";

import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { History, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/shared/data-table";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { FilterSelect } from "@/components/shared/filter-select";
import { PaginationBar } from "@/components/shared/pagination-bar";
import { useUrlState } from "@/hooks/use-url-state";
import { api } from "@/lib/api/client";
import { errorMessage } from "@/lib/api/errors";
import { ROLE_LABEL } from "@/lib/auth/roles";
import { formatDateTime, humanize } from "@/lib/format";
import { queryKeys } from "@/lib/query/keys";
import { auditParams } from "@/lib/query/report-params";
import type { AuditLog } from "@/types/domain";

const ENTITY_TYPES = [
  "Outage",
  "LoadSheddingSchedule",
  "Payment",
  "Bill",
  "User",
  "DistributionZone",
  "Substation",
  "Feeder",
  "Area",
  "Connection",
].map((value) => ({ value, label: value.replace(/([a-z])([A-Z])/g, "$1 $2") }));

const ACTIONS = [
  "OUTAGE_REPORTED",
  "OUTAGE_ACKNOWLEDGED",
  "OUTAGE_ASSIGNED",
  "OUTAGE_STATUS_CHANGED",
  "OUTAGE_RESTORED",
  "SCHEDULE_CREATED",
  "SCHEDULE_AUTO_GENERATED",
  "SCHEDULE_STATUS_CHANGED",
  "PAYMENT_COMPLETED",
  "BILLS_GENERATED",
  "BILLS_MARKED_OVERDUE",
  "USER_ROLE_CHANGED",
  "USER_BANNED",
  "USER_REINSTATED",
  "PROFILE_UPDATED",
];

/** Readable one-line summary of a JSON snapshot. */
const summarise = (value: unknown): string => {
  if (!value || typeof value !== "object") return "—";
  return Object.entries(value as Record<string, unknown>)
    .slice(0, 4)
    .map(([key, entry]) => `${key}: ${typeof entry === "object" ? JSON.stringify(entry) : String(entry)}`)
    .join(" · ");
};

export function AuditLogTable() {
  const searchParams = useSearchParams();
  const { reset } = useUrlState();
  const params = auditParams(searchParams);

  const query = useQuery({
    queryKey: queryKeys.admin.auditLogs(params),
    queryFn: ({ signal }) => api.list<AuditLog>("/admin/audit-logs", params, signal),
    placeholderData: (previous) => previous,
  });

  const columns: ColumnDef<AuditLog, unknown>[] = [
    {
      id: "when",
      header: "When",
      cell: ({ row }) => <span className="text-sm whitespace-nowrap text-muted-foreground">{formatDateTime(row.original.createdAt)}</span>,
    },
    {
      id: "actor",
      header: "Actor",
      cell: ({ row }) =>
        row.original.actor ? (
          <div className="min-w-36">
            <p className="text-sm font-medium">{row.original.actor.name}</p>
            <p className="text-xs text-muted-foreground">{ROLE_LABEL[row.original.actor.role]}</p>
          </div>
        ) : (
          <span className="text-sm text-muted-foreground">System</span>
        ),
    },
    {
      id: "action",
      header: "Action",
      cell: ({ row }) => <span className="font-mono text-xs whitespace-nowrap">{row.original.action}</span>,
    },
    {
      id: "entity",
      header: "Record",
      cell: ({ row }) => (
        <div>
          <p className="text-sm">{row.original.entityType.replace(/([a-z])([A-Z])/g, "$1 $2")}</p>
          <p className="font-mono text-xs text-muted-foreground">{row.original.entityId.slice(0, 8)}…</p>
        </div>
      ),
    },
    {
      id: "change",
      header: "Change",
      cell: ({ row }) => (
        <details className="max-w-80 text-xs">
          <summary className="cursor-pointer truncate text-muted-foreground">{summarise(row.original.after)}</summary>
          <div className="mt-2 grid gap-2">
            <div>
              <p className="font-medium">Before</p>
              <pre className="overflow-x-auto rounded bg-muted p-2 whitespace-pre-wrap">{JSON.stringify(row.original.before, null, 2)}</pre>
            </div>
            <div>
              <p className="font-medium">After</p>
              <pre className="overflow-x-auto rounded bg-muted p-2 whitespace-pre-wrap">{JSON.stringify(row.original.after, null, 2)}</pre>
            </div>
          </div>
        </details>
      ),
    },
  ];

  const hasFilters = ["entityType", "action"].some((key) => searchParams.get(key));

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <FilterSelect param="entityType" label="Records" options={ENTITY_TYPES} className="sm:w-52" />
        <FilterSelect param="action" label="Actions" options={ACTIONS.map((value) => ({ value, label: humanize(value) }))} className="sm:w-60" />
        {hasFilters && (
          <Button variant="ghost" onClick={() => reset(["tab"])}>
            <RotateCcw /> Reset
          </Button>
        )}
      </div>
      {query.isError && !query.data ? (
        <ErrorState message={errorMessage(query.error)} onRetry={() => query.refetch()} />
      ) : (
        <>
          <DataTable
            columns={columns}
            data={query.data?.data ?? []}
            isLoading={query.isPending}
            isFetching={query.isFetching}
            getRowId={(log) => log.id}
            empty={<EmptyState icon={History} title="No audit entries" description="Critical actions are recorded here as they happen." />}
          />
          {query.data && <PaginationBar meta={query.data.meta} noun="entries" />}
        </>
      )}
    </div>
  );
}

"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { CircleCheck, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OutageProgress } from "@/components/outages/outage-timeline";
import { DataTable } from "@/components/shared/data-table";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { FilterSelect, type FilterOption } from "@/components/shared/filter-select";
import { PaginationBar } from "@/components/shared/pagination-bar";
import { SearchInput } from "@/components/shared/search-input";
import { StatusBadge } from "@/components/shared/status-badge";
import { useUrlState } from "@/hooks/use-url-state";
import { api } from "@/lib/api/client";
import { errorMessage } from "@/lib/api/errors";
import { formatDateTime, formatRelative } from "@/lib/format";
import { queryKeys } from "@/lib/query/keys";
import { OUTAGE_ENDPOINT, outageParams, type OutageScope } from "@/lib/query/outage-params";
import { OUTAGE_SEVERITIES, OUTAGE_STATUSES, type Outage } from "@/types/domain";

interface OutageListProps {
  scope: OutageScope;
  /** Detail page prefix, e.g. "/dashboard/outages". */
  basePath: string;
  zones?: FilterOption[];
  renderActions?: (outage: Outage) => ReactNode;
  emptyTitle: string;
  emptyDescription: string;
  emptyAction?: ReactNode;
}

const SORT_OPTIONS: FilterOption[] = [
  { value: "reportedAt", label: "Newest first" },
  { value: "severity", label: "Severity" },
  { value: "status", label: "Status" },
];

/**
 * Outage table shared by all three roles. Filters and paging live in the
 * URL; the first page arrives prefetched from the server.
 */
export function OutageList({
  scope,
  basePath,
  zones,
  renderActions,
  emptyTitle,
  emptyDescription,
  emptyAction,
}: OutageListProps) {
  const searchParams = useSearchParams();
  const { reset } = useUrlState();
  const params = outageParams(searchParams, scope);

  const query = useQuery({
    queryKey: queryKeys.outages.list(scope, params),
    queryFn: ({ signal }) => api.list<Outage>(OUTAGE_ENDPOINT[scope], params, signal),
    placeholderData: (previous) => previous,
  });

  const columns: ColumnDef<Outage, unknown>[] = [
    {
      id: "outage",
      header: "Outage",
      cell: ({ row }) => (
        <div className="min-w-56 space-y-0.5">
          <Link href={`${basePath}/${row.original.id}`} className="line-clamp-1 font-medium hover:underline">
            {row.original.title}
          </Link>
          <p className="text-xs text-muted-foreground">
            {row.original.area.name} · {row.original.area.feeder.name}
          </p>
        </div>
      ),
    },
    {
      id: "severity",
      header: "Severity",
      cell: ({ row }) => <StatusBadge status={row.original.severity} kind="scale" />,
    },
    {
      id: "status",
      header: "Status",
      cell: ({ row }) => (
        <div className="space-y-1.5">
          <StatusBadge status={row.original.status} />
          <OutageProgress status={row.original.status} />
        </div>
      ),
    },
    {
      id: "technician",
      header: "Technician",
      cell: ({ row }) =>
        row.original.assignments[0] ? (
          <span className="text-sm">{row.original.assignments[0].technician.name}</span>
        ) : (
          <span className="text-sm text-muted-foreground">Unassigned</span>
        ),
    },
    {
      id: "reported",
      header: "Reported",
      cell: ({ row }) => (
        <time dateTime={row.original.reportedAt} title={formatDateTime(row.original.reportedAt)} className="text-sm whitespace-nowrap text-muted-foreground">
          {formatRelative(row.original.reportedAt)}
        </time>
      ),
    },
  ];

  if (renderActions) {
    columns.push({
      id: "actions",
      header: () => <span className="sr-only">Actions</span>,
      cell: ({ row }) => <div className="flex justify-end">{renderActions(row.original)}</div>,
    });
  }

  const hasFilters = ["search", "status", "severity", "zoneId"].some((key) => searchParams.get(key));

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 lg:flex-row lg:flex-wrap">
        {scope !== "assigned" && <SearchInput placeholder="Search title or description…" />}
        <FilterSelect param="status" label="Status" options={OUTAGE_STATUSES} />
        {scope !== "assigned" && <FilterSelect param="severity" label="Severity" options={OUTAGE_SEVERITIES} />}
        {zones && <FilterSelect param="zoneId" label="Zones" options={zones} />}
        {scope !== "assigned" && <FilterSelect param="sortBy" label="Sort" options={SORT_OPTIONS} allLabel="Default" />}
        {hasFilters && (
          <Button variant="ghost" onClick={() => reset()}>
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
            getRowId={(outage) => outage.id}
            empty={
              <EmptyState
                icon={CircleCheck}
                title={hasFilters ? "No outages match these filters" : emptyTitle}
                description={hasFilters ? "Try a different status or clear the filters." : emptyDescription}
                action={
                  hasFilters ? (
                    <Button variant="outline" onClick={() => reset()}>
                      Clear filters
                    </Button>
                  ) : (
                    emptyAction
                  )
                }
              />
            }
          />
          {query.data && <PaginationBar meta={query.data.meta} noun="outages" />}
        </>
      )}
    </div>
  );
}

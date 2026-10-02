"use client";

import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { ReceiptText, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/shared/data-table";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { FilterSelect } from "@/components/shared/filter-select";
import { PaginationBar } from "@/components/shared/pagination-bar";
import { SearchInput } from "@/components/shared/search-input";
import { StatusBadge } from "@/components/shared/status-badge";
import { useUrlState } from "@/hooks/use-url-state";
import { api } from "@/lib/api/client";
import { errorMessage } from "@/lib/api/errors";
import { lastMonths, monthLabel } from "@/lib/charts";
import { formatBDT, formatDate } from "@/lib/format";
import { billParams } from "@/lib/query/billing-params";
import { queryKeys } from "@/lib/query/keys";
import { BILL_STATUSES, type Bill } from "@/types/domain";

const PERIOD_OPTIONS = lastMonths(12)
  .reverse()
  .map((month) => ({ value: month, label: monthLabel(month) }));

export function AdminBillsTable() {
  const searchParams = useSearchParams();
  const { reset } = useUrlState();
  const params = billParams(searchParams);

  const query = useQuery({
    queryKey: queryKeys.bills.list("all", params),
    queryFn: ({ signal }) => api.list<Bill>("/bills", params, signal),
    placeholderData: (previous) => previous,
  });

  const columns: ColumnDef<Bill, unknown>[] = [
    {
      id: "customer",
      header: "Customer",
      cell: ({ row }) => (
        <div className="min-w-44">
          <p className="font-medium">{row.original.customer.name}</p>
          <p className="text-xs text-muted-foreground">{row.original.customer.email}</p>
        </div>
      ),
    },
    {
      id: "meter",
      header: "Meter",
      cell: ({ row }) => (
        <div>
          <p className="font-mono text-sm">{row.original.connection.meterNo}</p>
          <p className="text-xs text-muted-foreground">{row.original.connection.area.name}</p>
        </div>
      ),
    },
    { id: "period", header: "Period", cell: ({ row }) => monthLabel(row.original.billingPeriod) },
    { id: "usage", header: "Usage", cell: ({ row }) => <span className="tabular-nums">{row.original.unitsConsumed} kWh</span> },
    {
      id: "total",
      header: "Total",
      cell: ({ row }) => (
        <div>
          <p className="font-medium tabular-nums">{formatBDT(row.original.totalAmount)}</p>
          {row.original.lateFee > 0 && <p className="text-xs text-destructive">+{formatBDT(row.original.lateFee)} late fee</p>}
        </div>
      ),
    },
    { id: "due", header: "Due", cell: ({ row }) => <span className="text-sm whitespace-nowrap">{formatDate(row.original.dueDate)}</span> },
    { id: "status", header: "Status", cell: ({ row }) => <StatusBadge status={row.original.status} /> },
  ];

  const hasFilters = ["status", "billingPeriod", "search"].some((key) => searchParams.get(key));

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <SearchInput placeholder="Search meter number…" />
        <FilterSelect param="status" label="Status" options={BILL_STATUSES} />
        <FilterSelect param="billingPeriod" label="Periods" options={PERIOD_OPTIONS} />
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
            getRowId={(bill) => bill.id}
            empty={
              <EmptyState
                icon={ReceiptText}
                title={hasFilters ? "No bills match these filters" : "No bills issued yet"}
                description={hasFilters ? "Try another month or status." : "Generate a month's bills to get started."}
                action={hasFilters ? <Button variant="outline" onClick={() => reset(["tab"])}>Clear filters</Button> : undefined}
              />
            }
          />
          {query.data && <PaginationBar meta={query.data.meta} noun="bills" />}
        </>
      )}
    </div>
  );
}

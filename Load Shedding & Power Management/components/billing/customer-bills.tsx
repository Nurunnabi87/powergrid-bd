"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { CreditCard, ReceiptText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PayBillDialog } from "@/components/billing/pay-bill-dialog";
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
import { formatBDT, formatDate, formatMonth } from "@/lib/format";
import { billParams } from "@/lib/query/billing-params";
import { queryKeys } from "@/lib/query/keys";
import { BILL_STATUSES, type Bill } from "@/types/domain";

export function CustomerBills() {
  const searchParams = useSearchParams();
  const { reset } = useUrlState();
  const params = billParams(searchParams);
  const [paying, setPaying] = useState<Bill | null>(null);

  const query = useQuery({
    queryKey: queryKeys.bills.list("mine", params),
    queryFn: ({ signal }) => api.list<Bill>("/bills/my", params, signal),
    placeholderData: (previous) => previous,
  });

  const columns: ColumnDef<Bill, unknown>[] = [
    {
      id: "period",
      header: "Billing period",
      cell: ({ row }) => (
        <div>
          <p className="font-medium">{formatMonth(row.original.billingPeriod)}</p>
          <p className="text-xs text-muted-foreground">Issued {formatDate(row.original.issuedAt)}</p>
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
    {
      id: "usage",
      header: "Usage",
      cell: ({ row }) => <span className="tabular-nums">{row.original.unitsConsumed} kWh</span>,
    },
    {
      id: "total",
      header: "Total",
      cell: ({ row }) => (
        <div>
          <p className="font-medium tabular-nums">{formatBDT(row.original.totalAmount)}</p>
          {row.original.lateFee > 0 && (
            <p className="text-xs text-destructive">incl. {formatBDT(row.original.lateFee)} late fee</p>
          )}
        </div>
      ),
    },
    {
      id: "due",
      header: "Due",
      cell: ({ row }) => (
        <span className="text-sm whitespace-nowrap">
          {row.original.status === "PAID" ? `Paid ${formatDate(row.original.paidAt)}` : formatDate(row.original.dueDate)}
        </span>
      ),
    },
    { id: "status", header: "Status", cell: ({ row }) => <StatusBadge status={row.original.status} /> },
    {
      id: "actions",
      header: () => <span className="sr-only">Actions</span>,
      cell: ({ row }) =>
        row.original.status === "PAID" ? null : (
          <div className="flex justify-end">
            <Button size="sm" onClick={() => setPaying(row.original)}>
              <CreditCard /> Pay now
            </Button>
          </div>
        ),
    },
  ];

  const hasFilters = ["status", "search"].some((key) => searchParams.get(key));

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row">
        <SearchInput placeholder="Search by meter number…" />
        <FilterSelect param="status" label="Status" options={BILL_STATUSES} />
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
                title={hasFilters ? "No bills match these filters" : "No bills yet"}
                description={
                  hasFilters ? "Try clearing the filters." : "Monthly bills for your meters will appear here once they are issued."
                }
                action={hasFilters ? <Button variant="outline" onClick={() => reset()}>Clear filters</Button> : undefined}
              />
            }
          />
          {query.data && <PaginationBar meta={query.data.meta} noun="bills" />}
        </>
      )}

      <PayBillDialog bill={paying} open={paying !== null} onOpenChange={(open) => !open && setPaying(null)} />
    </div>
  );
}

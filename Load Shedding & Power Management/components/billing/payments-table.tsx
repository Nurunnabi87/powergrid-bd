"use client";

import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { CreditCard, Smartphone, WalletCards } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/shared/data-table";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { FilterSelect } from "@/components/shared/filter-select";
import { PaginationBar } from "@/components/shared/pagination-bar";
import { StatusBadge } from "@/components/shared/status-badge";
import { useUrlState } from "@/hooks/use-url-state";
import { api } from "@/lib/api/client";
import { errorMessage } from "@/lib/api/errors";
import { formatBDT, formatDateTime, formatMonth } from "@/lib/format";
import { paymentParams } from "@/lib/query/billing-params";
import { queryKeys } from "@/lib/query/keys";
import { PAYMENT_STATUSES, type Payment } from "@/types/domain";

const PROVIDER_OPTIONS = [
  { value: "STRIPE", label: "Card (Stripe)" },
  { value: "BKASH", label: "bKash" },
];

export const PAYMENT_ENDPOINT = { mine: "/payments/my", all: "/payments" } as const;

/** Payment history: the customer's own, or every payment for admins. */
export function PaymentsTable({ scope }: { scope: "mine" | "all" }) {
  const searchParams = useSearchParams();
  const { reset } = useUrlState();
  const params = paymentParams(searchParams);

  const query = useQuery({
    queryKey: queryKeys.payments.list(scope, params),
    queryFn: ({ signal }) => api.list<Payment>(PAYMENT_ENDPOINT[scope], params, signal),
    placeholderData: (previous) => previous,
  });

  const columns: ColumnDef<Payment, unknown>[] = [
    {
      id: "invoice",
      header: "Invoice",
      cell: ({ row }) => (
        <div>
          <p className="font-mono text-xs">{row.original.merchantInvoiceNumber}</p>
          <p className="text-xs text-muted-foreground">
            {formatMonth(row.original.bill.billingPeriod)} · {row.original.bill.connection.meterNo}
          </p>
        </div>
      ),
    },
    ...(scope === "all"
      ? [
          {
            id: "customer",
            header: "Customer",
            cell: ({ row }) => (
              <div>
                <p className="text-sm font-medium">{row.original.customer.name}</p>
                <p className="text-xs text-muted-foreground">{row.original.customer.email}</p>
              </div>
            ),
          } satisfies ColumnDef<Payment, unknown>,
        ]
      : []),
    {
      id: "method",
      header: "Method",
      cell: ({ row }) => (
        <span className="inline-flex items-center gap-1.5 text-sm">
          {row.original.provider === "STRIPE" ? <CreditCard className="size-4" aria-hidden /> : <Smartphone className="size-4" aria-hidden />}
          {row.original.provider === "STRIPE" ? "Card" : "bKash"}
        </span>
      ),
    },
    {
      id: "amount",
      header: "Amount",
      cell: ({ row }) => <span className="font-medium tabular-nums">{formatBDT(row.original.amount)}</span>,
    },
    {
      id: "status",
      header: "Status",
      cell: ({ row }) => (
        <div className="space-y-1">
          <StatusBadge status={row.original.status} />
          {row.original.failureReason && row.original.status !== "COMPLETED" && (
            <p className="max-w-48 truncate text-xs text-muted-foreground" title={row.original.failureReason}>
              {row.original.failureReason}
            </p>
          )}
        </div>
      ),
    },
    {
      id: "transaction",
      header: "Transaction",
      cell: ({ row }) =>
        row.original.trxID ? (
          <span className="block max-w-40 truncate font-mono text-xs" title={row.original.trxID}>
            {row.original.trxID}
          </span>
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        ),
    },
    {
      id: "date",
      header: "Date",
      cell: ({ row }) => (
        <span className="text-sm whitespace-nowrap text-muted-foreground">
          {formatDateTime(row.original.paidAt ?? row.original.initiatedAt)}
        </span>
      ),
    },
  ];

  const hasFilters = ["status", "provider"].some((key) => searchParams.get(key));

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row">
        <FilterSelect param="status" label="Status" options={PAYMENT_STATUSES} />
        <FilterSelect param="provider" label="Methods" options={PROVIDER_OPTIONS} />
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
            getRowId={(payment) => payment.id}
            empty={
              <EmptyState
                icon={WalletCards}
                title={hasFilters ? "No payments match these filters" : "No payments yet"}
                description={
                  hasFilters
                    ? "Try clearing the filters."
                    : scope === "mine"
                      ? "Payments you make from the Bills page will appear here with their receipts."
                      : "Customer payments will appear here as they are made."
                }
                action={hasFilters ? <Button variant="outline" onClick={() => reset()}>Clear filters</Button> : undefined}
              />
            }
          />
          {query.data && <PaginationBar meta={query.data.meta} noun="payments" />}
        </>
      )}
    </div>
  );
}

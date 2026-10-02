import type { Metadata } from "next";
import { HydrationBoundary, QueryClient, dehydrate } from "@tanstack/react-query";
import { CircleCheck, Receipt, TriangleAlert } from "lucide-react";
import { CustomerBills } from "@/components/billing/customer-bills";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { apiList } from "@/lib/api/server";
import { formatBDT } from "@/lib/format";
import { billParams } from "@/lib/query/billing-params";
import { queryKeys } from "@/lib/query/keys";
import type { Bill } from "@/types/domain";

export const metadata: Metadata = { title: "Bills" };

export default async function BillsPage({ searchParams }: PageProps<"/dashboard/bills">) {
  const params = billParams(await searchParams);
  const queryClient = new QueryClient();

  // Summary (all bills) and the filtered page the URL asks for, in parallel.
  const [all] = await Promise.all([
    apiList<Bill>("/bills/my", { query: { limit: 100 } }),
    queryClient.prefetchQuery({
      queryKey: queryKeys.bills.list("mine", params),
      queryFn: () => apiList<Bill>("/bills/my", { query: params }),
    }),
  ]);

  const unpaid = all.data.filter((bill) => bill.status !== "PAID");
  const overdue = unpaid.filter((bill) => bill.status === "OVERDUE");
  const paidTotal = all.data.filter((bill) => bill.status === "PAID").reduce((sum, bill) => sum + bill.totalAmount, 0);

  return (
    <>
      <PageHeader
        title="Bills"
        description="Monthly electricity bills for your meters. Pay securely by card (Stripe) or bKash."
      />
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Outstanding"
          value={formatBDT(unpaid.reduce((sum, bill) => sum + bill.totalAmount, 0))}
          icon={Receipt}
          accent={unpaid.length ? "warning" : "success"}
          hint={`${unpaid.length} bill(s) awaiting payment`}
        />
        <StatCard
          label="Overdue"
          value={overdue.length}
          icon={TriangleAlert}
          accent={overdue.length ? "danger" : "success"}
          hint={overdue.length ? "A 5% late fee has been applied" : "Nothing overdue"}
        />
        <StatCard
          label="Paid to date"
          value={formatBDT(paidTotal)}
          icon={CircleCheck}
          accent="success"
          hint={`${all.data.length - unpaid.length} bill(s) settled`}
        />
      </div>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <CustomerBills />
      </HydrationBoundary>
    </>
  );
}

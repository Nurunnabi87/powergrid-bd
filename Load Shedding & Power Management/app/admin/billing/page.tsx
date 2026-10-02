import type { Metadata } from "next";
import { HydrationBoundary, QueryClient, dehydrate } from "@tanstack/react-query";
import { Banknote, CircleCheck, Receipt, TriangleAlert } from "lucide-react";
import { ApplyOverdueButton } from "@/components/admin/billing/apply-overdue-button";
import { BillingTabs } from "@/components/admin/billing/billing-tabs";
import { GenerateBillsDialog } from "@/components/admin/billing/generate-bills-dialog";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { apiGet, apiList } from "@/lib/api/server";
import { formatBDT } from "@/lib/format";
import { billParams, paymentParams } from "@/lib/query/billing-params";
import { queryKeys } from "@/lib/query/keys";
import type { Bill, DashboardStats, Payment } from "@/types/domain";

export const metadata: Metadata = { title: "Billing" };

export default async function AdminBillingPage({ searchParams }: PageProps<"/admin/billing">) {
  const query = await searchParams;
  const tab = query.tab === "payments" ? "payments" : "bills";
  const queryClient = new QueryClient();

  const [stats] = await Promise.all([
    apiGet<DashboardStats>("/admin/dashboard-stats"),
    tab === "bills"
      ? queryClient.prefetchQuery({
          queryKey: queryKeys.bills.list("all", billParams(query)),
          queryFn: () => apiList<Bill>("/bills", { query: billParams(query) }),
        })
      : queryClient.prefetchQuery({
          queryKey: queryKeys.payments.list("all", paymentParams(query)),
          queryFn: () => apiList<Payment>("/payments", { query: paymentParams(query) }),
        }),
  ]);

  const { billing, revenue } = stats;

  return (
    <>
      <PageHeader
        title="Billing & payments"
        description="Issue monthly bills, apply late fees and follow every card and bKash payment."
        actions={
          <>
            <ApplyOverdueButton />
            <GenerateBillsDialog />
          </>
        }
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Collected" value={formatBDT(revenue.totalCollected)} icon={Banknote} accent="success" hint={`${revenue.completedPayments} payments`} />
        <StatCard label="Outstanding" value={formatBDT(billing.unpaidAmount)} icon={Receipt} accent="warning" hint={`${billing.byStatus.UNPAID?.count ?? 0} unpaid bills`} />
        <StatCard
          label="Overdue"
          value={formatBDT(billing.byStatus.OVERDUE?.amount ?? 0)}
          icon={TriangleAlert}
          accent={billing.byStatus.OVERDUE?.count ? "danger" : "success"}
          hint={`${billing.byStatus.OVERDUE?.count ?? 0} bills with late fees`}
        />
        <StatCard label="Paid bills" value={billing.byStatus.PAID?.count ?? 0} icon={CircleCheck} accent="info" hint={formatBDT(billing.byStatus.PAID?.amount ?? 0)} />
      </div>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <BillingTabs tab={tab} />
      </HydrationBoundary>
    </>
  );
}

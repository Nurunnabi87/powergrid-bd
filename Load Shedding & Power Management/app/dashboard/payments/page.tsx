import type { Metadata } from "next";
import Link from "next/link";
import { HydrationBoundary, QueryClient, dehydrate } from "@tanstack/react-query";
import { Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PaymentsTable } from "@/components/billing/payments-table";
import { PageHeader } from "@/components/shared/page-header";
import { apiList } from "@/lib/api/server";
import { paymentParams } from "@/lib/query/billing-params";
import { queryKeys } from "@/lib/query/keys";
import type { Payment } from "@/types/domain";

export const metadata: Metadata = { title: "Payments" };

export default async function PaymentsPage({ searchParams }: PageProps<"/dashboard/payments">) {
  const params = paymentParams(await searchParams);
  const queryClient = new QueryClient();
  await queryClient.prefetchQuery({
    queryKey: queryKeys.payments.list("mine", params),
    queryFn: () => apiList<Payment>("/payments/my", { query: params }),
  });

  return (
    <>
      <PageHeader
        title="Payment history"
        description="Every card and bKash payment attempt, with gateway transaction IDs for completed payments."
        actions={
          <Button variant="outline" asChild>
            <Link href="/dashboard/bills">
              <Receipt /> Pay a bill
            </Link>
          </Button>
        }
      />
      <HydrationBoundary state={dehydrate(queryClient)}>
        <PaymentsTable scope="mine" />
      </HydrationBoundary>
    </>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { CircleCheck, CircleSlash, Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PaymentResult } from "@/components/billing/payment-result";
import { serverRequest } from "@/lib/api/server";

export const metadata: Metadata = { title: "Payment cancelled" };

/**
 * The payer backed out of checkout. The API expires the Stripe session and
 * returns the bill to UNPAID — unless the session was actually paid in the
 * meantime, in which case it settles instead of cancelling.
 */
export default async function PaymentCancelPage({ searchParams }: PageProps<"/payment/cancel">) {
  const { paymentId } = await searchParams;

  let settledInstead = false;
  if (typeof paymentId === "string" && /^[0-9a-f-]{36}$/i.test(paymentId)) {
    const result = await serverRequest<{ status: string }>(`/payments/${paymentId}/cancel`, { method: "POST" }).catch(
      () => null
    );
    settledInstead = result?.data.status === "COMPLETED";
  }

  if (settledInstead) {
    return (
      <PaymentResult
        icon={CircleCheck}
        tone="success"
        title="This payment actually went through"
        description="Your bill was paid before checkout was closed, so nothing was cancelled."
        actions={
          <Button asChild>
            <Link href="/dashboard/payments">View receipt</Link>
          </Button>
        }
      />
    );
  }

  return (
    <PaymentResult
      icon={CircleSlash}
      tone="warning"
      title="Payment cancelled"
      description="No money was taken. Your bill is still unpaid, and you can pay it whenever you're ready."
      actions={
        <>
          <Button asChild>
            <Link href="/dashboard/bills">
              <Receipt /> Try again
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/dashboard">Back to dashboard</Link>
          </Button>
        </>
      }
    />
  );
}

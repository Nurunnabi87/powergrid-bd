import type { Metadata } from "next";
import Link from "next/link";
import { CircleX, LifeBuoy, Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PaymentResult } from "@/components/billing/payment-result";
import { apiGet } from "@/lib/api/server";
import type { Payment } from "@/types/domain";

export const metadata: Metadata = { title: "Payment failed" };

/** The gateway declined or could not complete the payment. */
export default async function PaymentFailedPage({ searchParams }: PageProps<"/payment/failed">) {
  const { paymentId, reason } = await searchParams;

  const payment =
    typeof paymentId === "string" && /^[0-9a-f-]{36}$/i.test(paymentId)
      ? await apiGet<Payment>(`/payments/${paymentId}`).catch(() => null)
      : null;

  const detail = payment?.failureReason ?? (typeof reason === "string" ? reason : null);

  return (
    <PaymentResult
      icon={CircleX}
      tone="danger"
      title="Payment failed"
      description="The payment couldn't be completed and you have not been charged. Your bill is still open."
      actions={
        <>
          <Button asChild>
            <Link href="/dashboard/bills">
              <Receipt /> Try again
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/contact">
              <LifeBuoy /> Contact support
            </Link>
          </Button>
        </>
      }
    >
      {detail && (
        <p className="rounded-lg border border-destructive/25 bg-destructive/5 p-3 text-sm">
          <span className="font-medium">Gateway response: </span>
          <span className="text-muted-foreground">{detail}</span>
        </p>
      )}
    </PaymentResult>
  );
}

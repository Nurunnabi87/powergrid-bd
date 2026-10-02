import type { Metadata } from "next";
import Link from "next/link";
import { CircleCheck, Clock, History, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PaymentResult, ReceiptRows } from "@/components/billing/payment-result";
import { RefreshButton } from "@/components/billing/refresh-button";
import { errorMessage } from "@/lib/api/errors";
import { apiGet, serverRequest } from "@/lib/api/server";
import { formatBDT, formatDateTime, formatMonth } from "@/lib/format";
import type { Payment, VerifyPaymentResult } from "@/types/domain";

export const metadata: Metadata = { title: "Payment successful" };

const isUuid = (value: unknown): value is string =>
  typeof value === "string" && /^[0-9a-f-]{36}$/i.test(value);

/**
 * Stripe / bKash return here after checkout. The redirect alone proves
 * nothing, so the payment is verified with the gateway through the API
 * (idempotent: a refresh or a second visit just reads the settled result).
 */
export default async function PaymentSuccessPage({ searchParams }: PageProps<"/payment/success">) {
  const { paymentId } = await searchParams;

  if (!isUuid(paymentId)) {
    return (
      <PaymentResult
        icon={Clock}
        tone="warning"
        title="We couldn't identify this payment"
        description="The return link is missing its payment reference. Check your payment history for the latest status."
        actions={
          <Button asChild>
            <Link href="/dashboard/payments">
              <History /> Payment history
            </Link>
          </Button>
        }
      />
    );
  }

  let verifyError: string | null = null;
  try {
    await serverRequest<VerifyPaymentResult>(`/payments/${paymentId}/verify`, { method: "POST" });
  } catch (error) {
    verifyError = errorMessage(error, "The payment could not be verified");
  }

  const payment = await apiGet<Payment>(`/payments/${paymentId}`).catch(() => null);

  if (verifyError || !payment || payment.status !== "COMPLETED") {
    return (
      <PaymentResult
        icon={Clock}
        tone="warning"
        title="Payment not confirmed yet"
        description={
          verifyError ??
          "The gateway hasn't confirmed this payment yet. If you completed checkout, it usually confirms within a few seconds."
        }
        actions={
          <>
            <RefreshButton />
            <Button variant="ghost" asChild>
              <Link href="/dashboard/bills">Back to bills</Link>
            </Button>
          </>
        }
      />
    );
  }

  return (
    <PaymentResult
      icon={CircleCheck}
      tone="success"
      title="Payment successful"
      description={`Thank you, ${payment.customer.name.split(" ")[0]}. Your ${formatMonth(payment.bill.billingPeriod)} bill is now paid.`}
      actions={
        <>
          <Button asChild>
            <Link href="/dashboard">
              <LayoutDashboard /> Back to dashboard
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/dashboard/payments">
              <History /> Payment history
            </Link>
          </Button>
        </>
      }
    >
      <ReceiptRows
        rows={[
          { label: "Amount paid", value: formatBDT(payment.amount) },
          { label: "Method", value: payment.provider === "STRIPE" ? "Card (Stripe)" : "bKash" },
          { label: "Meter", value: payment.bill.connection.meterNo },
          { label: "Paid at", value: formatDateTime(payment.paidAt) },
          { label: "Invoice", value: payment.merchantInvoiceNumber, mono: true },
          { label: "Transaction ID", value: payment.trxID ?? "—", mono: true },
        ]}
      />
      <p className="mt-3 text-center text-xs text-muted-foreground">A receipt has also been sent to {payment.customer.email}.</p>
    </PaymentResult>
  );
}

"use client";

import { useState } from "react";
import { CreditCard, ExternalLink, Lock, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { api } from "@/lib/api/client";
import { formatBDT, formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Bill, InitiatePaymentResult, PaymentProvider } from "@/types/domain";

const PROVIDERS: { value: PaymentProvider; title: string; text: string; icon: typeof CreditCard }[] = [
  {
    value: "STRIPE",
    title: "Card",
    text: "Visa, Mastercard or Amex via Stripe Checkout",
    icon: CreditCard,
  },
  {
    value: "BKASH",
    title: "bKash",
    text: "Pay from your bKash wallet",
    icon: Smartphone,
  },
];

/**
 * Starts a real gateway checkout. The API creates the session and returns a
 * hosted payment page URL; the browser leaves the app and comes back to
 * /payment/success or /payment/cancel, where the payment is verified.
 */
export function PayBillDialog({ bill, open, onOpenChange }: { bill: Bill | null; open: boolean; onOpenChange: (open: boolean) => void }) {
  const [provider, setProvider] = useState<PaymentProvider>("STRIPE");
  const [redirecting, setRedirecting] = useState(false);

  const initiate = useApiMutation<InitiatePaymentResult, { billId: string; provider: PaymentProvider }>({
    mutationFn: async (body) => (await api.post<InitiatePaymentResult>("/payments/initiate", body)).data,
    onSuccess: (result) => {
      setRedirecting(true);
      window.location.assign(result.redirectUrl);
    },
  });

  if (!bill) return null;
  const busy = initiate.isPending || redirecting;

  return (
    <Dialog open={open} onOpenChange={(next) => !busy && onOpenChange(next)}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Pay {bill.billingPeriod} bill</DialogTitle>
          <DialogDescription>
            Meter {bill.connection.meterNo} · due {formatDate(bill.dueDate)}
          </DialogDescription>
        </DialogHeader>

        <dl className="space-y-2 rounded-lg border bg-muted/30 p-4 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted-foreground">
              Energy ({bill.unitsConsumed} kWh × {bill.tariffRate})
            </dt>
            <dd className="tabular-nums">{formatBDT(bill.amount)}</dd>
          </div>
          {bill.lateFee > 0 && (
            <div className="flex justify-between text-destructive">
              <dt>Late fee (5%)</dt>
              <dd className="tabular-nums">{formatBDT(bill.lateFee)}</dd>
            </div>
          )}
          <div className="flex justify-between border-t pt-2 text-base font-semibold">
            <dt>Total</dt>
            <dd className="tabular-nums">{formatBDT(bill.totalAmount)}</dd>
          </div>
        </dl>

        <fieldset className="space-y-2">
          <legend className="mb-2 text-sm font-medium">Payment method</legend>
          <div role="radiogroup" className="grid gap-2">
            {PROVIDERS.map(({ value, title, text, icon: Icon }) => (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={provider === value}
                onClick={() => setProvider(value)}
                disabled={busy}
                className={cn(
                  "flex items-center gap-3 rounded-xl border p-3 text-left transition-colors hover:bg-muted/50",
                  provider === value && "border-primary bg-primary/5 ring-2 ring-primary/30"
                )}
              >
                <span className="flex size-10 items-center justify-center rounded-lg bg-secondary">
                  <Icon className="size-5" aria-hidden />
                </span>
                <span>
                  <span className="block font-medium">{title}</span>
                  <span className="block text-xs text-muted-foreground">{text}</span>
                </span>
              </button>
            ))}
          </div>
        </fieldset>

        {provider === "STRIPE" ? (
          <p className="rounded-lg bg-info/10 p-3 text-xs text-muted-foreground">
            <strong className="text-foreground">Test mode:</strong> use card 4242 4242 4242 4242, any future expiry and any CVC.
          </p>
        ) : (
          <p className="rounded-lg bg-info/10 p-3 text-xs text-muted-foreground">
            <strong className="text-foreground">Sandbox:</strong> wallet 01770618575, OTP 123456, PIN 12121.
          </p>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={busy}>
            Cancel
          </Button>
          <Button onClick={() => initiate.mutate({ billId: bill.id, provider })} disabled={busy}>
            {busy ? <Spinner /> : <Lock />}
            {redirecting ? "Redirecting…" : busy ? "Starting checkout…" : `Pay ${formatBDT(bill.totalAmount)}`}
            {!busy && <ExternalLink className="opacity-70" />}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

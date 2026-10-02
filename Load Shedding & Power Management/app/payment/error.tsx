"use client";

import { RouteError } from "@/components/shared/route-error";

export default function PaymentError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return <RouteError error={error} retry={retry} homeHref="/dashboard/bills" homeLabel="Back to bills" />;
}

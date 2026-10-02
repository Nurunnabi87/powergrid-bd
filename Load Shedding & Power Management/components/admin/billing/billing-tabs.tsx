"use client";

import { useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { CreditCard, Receipt } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdminBillsTable } from "@/components/admin/billing/admin-bills-table";
import { PaymentsTable } from "@/components/billing/payments-table";

export type BillingTab = "bills" | "payments";

export function BillingTabs({ tab }: { tab: BillingTab }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  return (
    <Tabs
      value={tab}
      onValueChange={(next) => startTransition(() => router.replace(`${pathname}?tab=${next}`, { scroll: false }))}
      className="gap-4"
    >
      <TabsList aria-label="Billing view">
        <TabsTrigger value="bills" disabled={isPending}>
          <Receipt /> Bills
        </TabsTrigger>
        <TabsTrigger value="payments" disabled={isPending}>
          <CreditCard /> Payments
        </TabsTrigger>
      </TabsList>
      <TabsContent value="bills">{tab === "bills" && <AdminBillsTable />}</TabsContent>
      <TabsContent value="payments">{tab === "payments" && <PaymentsTable scope="all" />}</TabsContent>
    </Tabs>
  );
}

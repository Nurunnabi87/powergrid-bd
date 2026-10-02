"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlarmClock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { api } from "@/lib/api/client";
import { queryKeys } from "@/lib/query/keys";

/** Marks unpaid bills past their due date as overdue with a 5% late fee. */
export function ApplyOverdueButton() {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const apply = useApiMutation<{ data: { updated: number } }>({
    mutationFn: () => api.post<{ updated: number }>("/bills/apply-overdue"),
    invalidate: [queryKeys.bills.all],
    successMessage: (result) => `${result.data.updated} bill(s) marked overdue`,
    onSuccess: () => {
      setOpen(false);
      router.refresh();
    },
  });

  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        <AlarmClock /> Apply late fees
      </Button>
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title="Apply late fees?"
        description="Every unpaid bill past its due date becomes overdue and gets a 5% late fee added. Customers see the new total immediately."
        confirmLabel="Apply late fees"
        loading={apply.isPending}
        onConfirm={() => apply.mutate()}
      />
    </>
  );
}

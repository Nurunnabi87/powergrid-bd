"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { PlayCircle, PlugZap } from "lucide-react";
import { useForm } from "react-hook-form";
import { FormField } from "@/components/forms/form-field";
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
import { Textarea } from "@/components/ui/textarea";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { api } from "@/lib/api/client";
import { queryKeys } from "@/lib/query/keys";
import { noteSchema, type NoteValues } from "@/lib/validations/outage";
import type { Outage } from "@/types/domain";

interface JobActionsProps {
  outage: Outage;
  size?: "sm" | "default";
}

/**
 * The technician's side of the outage state machine:
 * ASSIGNED → IN_PROGRESS (start work) → RESOLVED (restore power).
 * Restoring records downtime and notifies everyone in the area.
 */
export function JobActions({ outage, size = "default" }: JobActionsProps) {
  const router = useRouter();
  const [confirmStart, setConfirmStart] = useState(false);
  const [restoreOpen, setRestoreOpen] = useState(false);

  const form = useForm<NoteValues>({
    resolver: zodResolver(noteSchema),
    defaultValues: { note: "" },
  });

  const refresh = () => router.refresh();

  const start = useApiMutation({
    mutationFn: () => api.patch(`/outages/${outage.id}/status`, { status: "IN_PROGRESS" }),
    invalidate: [queryKeys.outages.all],
    successMessage: "Job started — status set to In progress",
    onSuccess: () => {
      setConfirmStart(false);
      refresh();
    },
  });

  const restore = useApiMutation<unknown, NoteValues, NoteValues>({
    mutationFn: ({ note }) => api.post<{ customersNotified: number }>(`/outages/${outage.id}/restore`, note ? { note } : {}),
    setError: form.setError,
    invalidate: [queryKeys.outages.all, queryKeys.notifications.all],
    successMessage: "Power restored. Customers in the area have been notified.",
    onSuccess: () => {
      setRestoreOpen(false);
      form.reset();
      refresh();
    },
  });

  if (outage.status === "ASSIGNED") {
    return (
      <>
        <Button size={size} onClick={() => setConfirmStart(true)}>
          <PlayCircle /> Start work
        </Button>
        <ConfirmDialog
          open={confirmStart}
          onOpenChange={setConfirmStart}
          title="Start this job?"
          description={`This marks "${outage.title}" as In progress so the customer and control room know you're on site.`}
          confirmLabel="Start work"
          loading={start.isPending}
          onConfirm={() => start.mutate()}
        />
      </>
    );
  }

  if (outage.status === "IN_PROGRESS") {
    return (
      <>
        <Button size={size} onClick={() => setRestoreOpen(true)} className="bg-success text-success-foreground hover:bg-success/85">
          <PlugZap /> Restore power
        </Button>
        <Dialog open={restoreOpen} onOpenChange={(open) => !restore.isPending && setRestoreOpen(open)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm power restored</DialogTitle>
              <DialogDescription>
                Downtime will be recorded and all {outage.affectedCustomers} customers in {outage.area.name} will be notified.
              </DialogDescription>
            </DialogHeader>
            <form id={`restore-${outage.id}`} onSubmit={form.handleSubmit((values) => restore.mutate(values))} noValidate>
              <FormField control={form.control} name="note" label="Resolution note (optional)" description="What was fixed, e.g. replaced blown HT fuse on pole 14.">
                {({ field, id, aria }) => <Textarea id={id} rows={4} maxLength={500} {...field} {...aria} />}
              </FormField>
            </form>
            <DialogFooter>
              <Button variant="outline" onClick={() => setRestoreOpen(false)} disabled={restore.isPending}>
                Cancel
              </Button>
              <Button type="submit" form={`restore-${outage.id}`} disabled={restore.isPending}>
                {restore.isPending ? <Spinner /> : <PlugZap />} Confirm restored
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  return null;
}

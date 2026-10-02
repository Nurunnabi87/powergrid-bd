"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Archive,
  Ban,
  ClipboardCheck,
  MoreHorizontal,
  PlugZap,
  Trash2,
  UserCheck,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { AssignTechnicianDialog } from "@/components/admin/assign-technician-dialog";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { api } from "@/lib/api/client";
import { queryKeys } from "@/lib/query/keys";
import { noteSchema, type NoteValues } from "@/lib/validations/outage";
import { OUTAGE_TRANSITIONS, type Outage } from "@/types/domain";

type Dialogs = "assign" | "acknowledge" | "close" | "delete" | "cancel" | "restore" | null;

interface OutageAdminActionsProps {
  outage: Outage;
  /** "menu" for table rows, "buttons" for the detail page. */
  variant?: "menu" | "buttons";
  /** Where to go after deleting (detail page). */
  afterDelete?: string;
}

/**
 * Control-room actions. Only transitions the API's state machine allows
 * from the current status are offered.
 */
export function OutageAdminActions({ outage, variant = "menu", afterDelete }: OutageAdminActionsProps) {
  const router = useRouter();
  const [dialog, setDialog] = useState<Dialogs>(null);
  const allowed = OUTAGE_TRANSITIONS[outage.status];
  const close = () => setDialog(null);
  const done = () => {
    close();
    router.refresh();
  };

  const noteForm = useForm<NoteValues>({ resolver: zodResolver(noteSchema), defaultValues: { note: "" } });

  const acknowledge = useApiMutation({
    mutationFn: () => api.patch(`/outages/${outage.id}/acknowledge`),
    invalidate: [queryKeys.outages.all],
    successMessage: "Outage acknowledged",
    onSuccess: done,
  });

  const setStatus = useApiMutation<unknown, { status: string; note?: string }>({
    mutationFn: (body) => api.patch(`/outages/${outage.id}/status`, body),
    invalidate: [queryKeys.outages.all],
    successMessage: "Outage status updated",
    onSuccess: () => {
      noteForm.reset();
      done();
    },
  });

  const restore = useApiMutation<unknown, NoteValues, NoteValues>({
    mutationFn: ({ note }) => api.post(`/outages/${outage.id}/restore`, note ? { note } : {}),
    setError: noteForm.setError,
    invalidate: [queryKeys.outages.all, queryKeys.users.all],
    successMessage: "Power restored and customers notified",
    onSuccess: () => {
      noteForm.reset();
      done();
    },
  });

  const remove = useApiMutation({
    mutationFn: () => api.delete(`/outages/${outage.id}`),
    invalidate: [queryKeys.outages.all],
    successMessage: "Outage deleted",
    onSuccess: () => {
      close();
      if (afterDelete) router.push(afterDelete);
      else router.refresh();
    },
  });

  const canAcknowledge = allowed.includes("ACKNOWLEDGED");
  const canAssign = allowed.includes("ASSIGNED");
  const canRestore = outage.status === "IN_PROGRESS";
  const canClose = allowed.includes("CLOSED");
  const canCancel = allowed.includes("CANCELLED");
  const canDelete = outage.status === "CLOSED" || outage.status === "CANCELLED";

  const items = [
    canAcknowledge && { key: "acknowledge", label: "Acknowledge", icon: ClipboardCheck, onSelect: () => setDialog("acknowledge") },
    canAssign && { key: "assign", label: "Dispatch technician", icon: UserCheck, onSelect: () => setDialog("assign") },
    canRestore && { key: "restore", label: "Mark power restored", icon: PlugZap, onSelect: () => setDialog("restore") },
    canClose && { key: "close", label: "Close outage", icon: Archive, onSelect: () => setDialog("close") },
  ].filter(Boolean) as { key: string; label: string; icon: typeof Archive; onSelect: () => void }[];

  const destructive = [
    canCancel && { key: "cancel", label: "Cancel outage", icon: Ban, onSelect: () => setDialog("cancel") },
    canDelete && { key: "delete", label: "Delete record", icon: Trash2, onSelect: () => setDialog("delete") },
  ].filter(Boolean) as { key: string; label: string; icon: typeof Archive; onSelect: () => void }[];

  const noteDialog = (kind: "cancel" | "restore") => {
    const isCancel = kind === "cancel";
    const pending = isCancel ? setStatus.isPending : restore.isPending;
    return (
      <Dialog open={dialog === kind} onOpenChange={(open) => !pending && !open && close()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isCancel ? "Cancel this outage?" : "Mark power restored?"}</DialogTitle>
            <DialogDescription>
              {isCancel
                ? "Use this for duplicates or false reports. Any assigned technician is released."
                : `Downtime is recorded and the ${outage.affectedCustomers} customers in ${outage.area.name} are notified.`}
            </DialogDescription>
          </DialogHeader>
          <form
            id={`${kind}-${outage.id}`}
            noValidate
            onSubmit={noteForm.handleSubmit(({ note }) =>
              isCancel ? setStatus.mutate({ status: "CANCELLED", ...(note ? { note } : {}) }) : restore.mutate({ note })
            )}
          >
            <FormField control={noteForm.control} name="note" label={isCancel ? "Reason (optional)" : "Resolution note (optional)"}>
              {({ field, id, aria }) => <Textarea id={id} rows={3} maxLength={500} {...field} {...aria} />}
            </FormField>
          </form>
          <DialogFooter>
            <Button variant="outline" onClick={close} disabled={pending}>
              Back
            </Button>
            <Button type="submit" form={`${kind}-${outage.id}`} variant={isCancel ? "destructive" : "default"} disabled={pending}>
              {pending && <Spinner />}
              {isCancel ? "Cancel outage" : "Confirm restored"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };

  if (items.length === 0 && destructive.length === 0) return null;

  return (
    <>
      {variant === "menu" ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" aria-label={`Actions for ${outage.title}`}>
              <MoreHorizontal />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {items.map((item) => (
              <DropdownMenuItem key={item.key} onSelect={item.onSelect}>
                <item.icon /> {item.label}
              </DropdownMenuItem>
            ))}
            {items.length > 0 && destructive.length > 0 && <DropdownMenuSeparator />}
            {destructive.map((item) => (
              <DropdownMenuItem key={item.key} variant="destructive" onSelect={item.onSelect}>
                <item.icon /> {item.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <div className="flex flex-wrap gap-2">
          {items.map((item, index) => (
            <Button key={item.key} variant={index === 0 ? "default" : "outline"} onClick={item.onSelect}>
              <item.icon /> {item.label}
            </Button>
          ))}
          {destructive.map((item) => (
            <Button key={item.key} variant="destructive" onClick={item.onSelect}>
              <item.icon /> {item.label}
            </Button>
          ))}
        </div>
      )}

      {canAssign && <AssignTechnicianDialog outage={outage} open={dialog === "assign"} onOpenChange={(open) => !open && close()} />}

      <ConfirmDialog
        open={dialog === "acknowledge"}
        onOpenChange={(open) => !open && close()}
        title="Acknowledge this outage?"
        description="Confirms the control room has verified the report. You can dispatch a technician next."
        confirmLabel="Acknowledge"
        loading={acknowledge.isPending}
        onConfirm={() => acknowledge.mutate()}
      />
      <ConfirmDialog
        open={dialog === "close"}
        onOpenChange={(open) => !open && close()}
        title="Close this outage?"
        description="Closing archives a resolved outage. It can't be reopened."
        confirmLabel="Close outage"
        loading={setStatus.isPending}
        onConfirm={() => setStatus.mutate({ status: "CLOSED" })}
      />
      <ConfirmDialog
        open={dialog === "delete"}
        onOpenChange={(open) => !open && close()}
        title="Delete this outage record?"
        description="The record is removed from all lists (soft delete). The audit log keeps its history."
        confirmLabel="Delete"
        destructive
        loading={remove.isPending}
        onConfirm={() => remove.mutate()}
      />
      {canCancel && noteDialog("cancel")}
      {canRestore && noteDialog("restore")}
    </>
  );
}

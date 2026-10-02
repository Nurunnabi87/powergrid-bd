"use client";

import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { HardHat, UserCheck } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
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
import { FieldError, FieldGroup, FieldLegend, FieldSet } from "@/components/ui/field";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { EmptyState } from "@/components/shared/empty-state";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { api } from "@/lib/api/client";
import { queryKeys } from "@/lib/query/keys";
import { cn } from "@/lib/utils";
import { assignSchema, type AssignValues } from "@/lib/validations/outage";
import type { Outage, TechnicianCapacity } from "@/types/domain";

/**
 * Dispatch dialog. Technicians come with live capacity from the API and the
 * same eligibility rules the assign endpoint enforces, so ineligible people
 * are shown but disabled. The server still has the final word: a
 * concurrent dispatch is rejected with 409 and surfaced as a toast.
 */
export function AssignTechnicianDialog({
  outage,
  open,
  onOpenChange,
}: {
  outage: Outage;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const zoneId = outage.area.feeder.substation.zoneId;

  const technicians = useQuery({
    queryKey: queryKeys.users.technicians({ zoneId }),
    queryFn: ({ signal }) => api.get<TechnicianCapacity[]>("/admin/technicians", { zoneId }, signal),
    enabled: open,
    staleTime: 10_000,
  });

  const form = useForm<AssignValues>({
    resolver: zodResolver(assignSchema),
    defaultValues: { technicianId: "", notes: "" },
  });

  const assign = useApiMutation<unknown, AssignValues, AssignValues>({
    mutationFn: ({ technicianId, notes }) =>
      api.post(`/outages/${outage.id}/assign`, { technicianId, ...(notes ? { notes } : {}) }),
    setError: form.setError,
    invalidate: [queryKeys.outages.all, queryKeys.users.all],
    successMessage: "Technician dispatched",
    onSuccess: () => {
      onOpenChange(false);
      form.reset();
      router.refresh();
    },
  });

  return (
    <Dialog open={open} onOpenChange={(next) => !assign.isPending && onOpenChange(next)}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Dispatch a technician</DialogTitle>
          <DialogDescription>
            {outage.title} · {outage.area.name}
          </DialogDescription>
        </DialogHeader>

        <form id={`assign-${outage.id}`} onSubmit={form.handleSubmit((values) => assign.mutate(values))} noValidate>
          <FieldGroup>
            <Controller
              control={form.control}
              name="technicianId"
              render={({ field, fieldState }) => (
                <FieldSet data-invalid={fieldState.invalid}>
                  <FieldLegend variant="label">Technician</FieldLegend>
                  {technicians.isPending ? (
                    <div className="space-y-2">
                      {[0, 1, 2].map((index) => (
                        <Skeleton key={index} className="h-16 w-full" />
                      ))}
                    </div>
                  ) : !technicians.data?.length ? (
                    <EmptyState icon={HardHat} title="No technicians found" className="py-6" />
                  ) : (
                    <div role="radiogroup" aria-label="Technician" className="max-h-72 space-y-2 overflow-y-auto pr-1">
                      {technicians.data.map((tech) => {
                        const selected = field.value === tech.id;
                        const reason = !tech.isAvailable
                          ? "Unavailable"
                          : tech.activeJobCount >= tech.maxConcurrentJobs
                            ? "At capacity"
                            : !tech.inZone
                              ? "Other zone"
                              : tech.status !== "ACTIVE"
                                ? "Banned"
                                : null;
                        return (
                          <button
                            key={tech.id}
                            type="button"
                            role="radio"
                            aria-checked={selected}
                            disabled={!tech.canTakeJob}
                            onClick={() => field.onChange(tech.id)}
                            className={cn(
                              "flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-colors hover:bg-muted/50 disabled:cursor-not-allowed disabled:opacity-50",
                              selected && "border-primary bg-primary/5 ring-2 ring-primary/30"
                            )}
                          >
                            <div className="min-w-0 flex-1 space-y-1">
                              <div className="flex items-center justify-between gap-2">
                                <p className="truncate font-medium">{tech.name}</p>
                                {reason ? (
                                  <span className="text-xs text-muted-foreground">{reason}</span>
                                ) : (
                                  <span className="text-xs font-medium text-success">Available</span>
                                )}
                              </div>
                              <p className="truncate text-xs text-muted-foreground">
                                {tech.specialization} · {tech.zone?.name ?? "Any zone"}
                              </p>
                              <div className="flex items-center gap-2">
                                <Progress value={(tech.activeJobCount / tech.maxConcurrentJobs) * 100} className="h-1.5" aria-label="Workload" />
                                <span className="text-xs whitespace-nowrap text-muted-foreground tabular-nums">
                                  {tech.activeJobCount}/{tech.maxConcurrentJobs} jobs
                                </span>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                  {fieldState.error && <FieldError errors={[fieldState.error]} />}
                </FieldSet>
              )}
            />
            <FormField control={form.control} name="notes" label="Notes for the technician (optional)">
              {({ field, id, aria }) => <Textarea id={id} rows={3} maxLength={500} placeholder="Access details, hazards…" {...field} {...aria} />}
            </FormField>
          </FieldGroup>
        </form>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={assign.isPending}>
            Cancel
          </Button>
          <Button type="submit" form={`assign-${outage.id}`} disabled={assign.isPending}>
            {assign.isPending ? <Spinner /> : <UserCheck />} Dispatch
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

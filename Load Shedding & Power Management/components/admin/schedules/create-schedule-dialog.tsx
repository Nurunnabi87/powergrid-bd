"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { CalendarPlus, TriangleAlert } from "lucide-react";
import { useForm } from "react-hook-form";
import { FormField } from "@/components/forms/form-field";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { api } from "@/lib/api/client";
import { dhakaToIso, todayInDhaka } from "@/lib/format";
import { queryKeys } from "@/lib/query/keys";
import { scheduleSchema, type ScheduleValues } from "@/lib/validations/schedule";
import type { Feeder, Schedule } from "@/types/domain";

/** Manually publish a single load-shedding slot on one feeder. */
export function CreateScheduleDialog() {
  const [open, setOpen] = useState(false);
  const [conflict, setConflict] = useState<string | null>(null);

  const feeders = useQuery({
    queryKey: queryKeys.network.options("feeders"),
    queryFn: ({ signal }) => api.list<Feeder>("/feeders", { limit: 100, sortBy: "name", sortOrder: "asc" }, signal),
    enabled: open,
    staleTime: 5 * 60_000,
  });

  // Feeders grouped by zone for a scannable select.
  const byZone = new Map<string, Feeder[]>();
  for (const feeder of feeders.data?.data ?? []) {
    const zone = feeder.substation.zone.name;
    byZone.set(zone, [...(byZone.get(zone) ?? []), feeder]);
  }

  const form = useForm<ScheduleValues>({
    resolver: zodResolver(scheduleSchema),
    defaultValues: { feederId: "", date: todayInDhaka(), startTime: "14:00", endTime: "16:00", reason: "" },
    mode: "onTouched",
  });

  const create = useApiMutation<Schedule, ScheduleValues, ScheduleValues>({
    mutationFn: async ({ feederId, date, startTime, endTime, reason }) =>
      (
        await api.post<Schedule>("/schedules", {
          feederId,
          date,
          startTime: dhakaToIso(date, startTime),
          endTime: dhakaToIso(date, endTime),
          ...(reason ? { reason } : {}),
        })
      ).data,
    setError: form.setError,
    invalidate: [queryKeys.schedules.all],
    successMessage: "Load-shedding slot published",
    onSuccess: () => {
      setOpen(false);
      setConflict(null);
      form.reset();
    },
    // A 409 means the feeder already has an overlapping slot: keep the
    // dialog open and explain, rather than a toast that disappears.
    onError: (error) => setConflict(error.status === 409 ? error.message : null),
  });

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (create.isPending) return;
        setOpen(next);
        if (!next) setConflict(null);
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline">
          <CalendarPlus /> New slot
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Publish a load-shedding slot</DialogTitle>
          <DialogDescription>Customers on this feeder are notified. Times are in Bangladesh time.</DialogDescription>
        </DialogHeader>

        {conflict && (
          <Alert variant="destructive">
            <TriangleAlert />
            <AlertTitle>Schedule conflict</AlertTitle>
            <AlertDescription>{conflict}. Choose another time or cancel the existing slot first.</AlertDescription>
          </Alert>
        )}

        <form id="create-schedule" onSubmit={form.handleSubmit((values) => create.mutate(values))} noValidate>
          <FieldGroup>
            <FormField control={form.control} name="feederId" label="Feeder">
              {({ field, id, aria }) => (
                <Select value={field.value} onValueChange={field.onChange} disabled={feeders.isPending}>
                  <SelectTrigger id={id} className="w-full" {...aria}>
                    <SelectValue placeholder={feeders.isPending ? "Loading feeders…" : "Choose a feeder"} />
                  </SelectTrigger>
                  <SelectContent>
                    {[...byZone.entries()].map(([zone, list]) => (
                      <SelectGroup key={zone}>
                        <SelectLabel>{zone}</SelectLabel>
                        {list.map((feeder) => (
                          <SelectItem key={feeder.id} value={feeder.id}>
                            {feeder.name} · {feeder.code} ({Math.round(feeder.loadKw).toLocaleString()} kW)
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </FormField>
            <FormField control={form.control} name="date" label="Date">
              {({ field, id, aria }) => <Input id={id} type="date" {...field} {...aria} />}
            </FormField>
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="startTime" label="Starts">
                {({ field, id, aria }) => <Input id={id} type="time" step={900} {...field} {...aria} />}
              </FormField>
              <FormField control={form.control} name="endTime" label="Ends">
                {({ field, id, aria }) => <Input id={id} type="time" step={900} {...field} {...aria} />}
              </FormField>
            </div>
            <FormField control={form.control} name="reason" label="Reason (optional)">
              {({ field, id, aria }) => <Input id={id} placeholder="e.g. Generation shortfall at Ghorasal" maxLength={255} {...field} {...aria} />}
            </FormField>
          </FieldGroup>
        </form>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={create.isPending}>
            Cancel
          </Button>
          <Button type="submit" form="create-schedule" disabled={create.isPending}>
            {create.isPending ? <Spinner /> : <CalendarPlus />} Publish slot
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

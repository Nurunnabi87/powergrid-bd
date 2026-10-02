"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { FilePlus2 } from "lucide-react";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { useRelationOptions } from "@/components/admin/network/use-relation-options";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { api } from "@/lib/api/client";
import { todayInDhaka } from "@/lib/format";
import { queryKeys } from "@/lib/query/keys";
import { generateBillsSchema, type GenerateBillsInput, type GenerateBillsValues } from "@/lib/validations/billing";

interface GenerateBillsResult {
  billingPeriod: string;
  connectionsConsidered: number;
  billsCreated: number;
  alreadyExisting: number;
}

/** Issue a month's bills for every active meter (safe to re-run). */
export function GenerateBillsDialog() {
  const [open, setOpen] = useState(false);
  const areas = useRelationOptions("areas", open);
  const today = todayInDhaka();

  const form = useForm<GenerateBillsInput, unknown, GenerateBillsValues>({
    resolver: zodResolver(generateBillsSchema),
    defaultValues: { billingPeriod: today.slice(0, 7), dueDate: "", areaId: "all", defaultUnits: "" },
    mode: "onTouched",
  });

  const generate = useApiMutation<GenerateBillsResult, GenerateBillsValues, GenerateBillsInput>({
    mutationFn: async ({ billingPeriod, dueDate, areaId, defaultUnits }) =>
      (
        await api.post<GenerateBillsResult>("/bills/generate", {
          billingPeriod,
          dueDate,
          ...(areaId !== "all" ? { areaId } : {}),
          ...(defaultUnits !== "" ? { defaultUnits } : {}),
        })
      ).data,
    setError: form.setError,
    invalidate: [queryKeys.bills.all],
    successMessage: (result) =>
      `${result.billsCreated} bill(s) issued for ${result.billingPeriod}` +
      (result.alreadyExisting ? ` · ${result.alreadyExisting} already existed` : ""),
    onSuccess: () => {
      setOpen(false);
      form.reset();
    },
  });

  return (
    <Dialog open={open} onOpenChange={(next) => !generate.isPending && setOpen(next)}>
      <DialogTrigger asChild>
        <Button>
          <FilePlus2 /> Generate bills
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Generate monthly bills</DialogTitle>
          <DialogDescription>
            Bills every active meter for the month. Re-running is safe: meters already billed are skipped.
          </DialogDescription>
        </DialogHeader>
        <form id="generate-bills" onSubmit={form.handleSubmit((values) => generate.mutate(values))} noValidate>
          <FieldGroup>
            <FormField control={form.control} name="billingPeriod" label="Billing month">
              {({ field, id, aria }) => <Input id={id} type="month" {...field} {...aria} />}
            </FormField>
            <FormField control={form.control} name="dueDate" label="Due date">
              {({ field, id, aria }) => <Input id={id} type="date" min={today} {...field} {...aria} />}
            </FormField>
            <FormField control={form.control} name="areaId" label="Area">
              {({ field, id, aria }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id={id} className="w-full" {...aria}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All areas</SelectItem>
                    {(areas.data ?? []).map((area) => (
                      <SelectItem key={area.value} value={area.value}>
                        {area.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </FormField>
            <FormField
              control={form.control}
              name="defaultUnits"
              label="Units per meter (optional)"
              description="Leave empty to use each meter's reading (120–299 kWh in this demo)."
            >
              {({ field, id, aria }) => (
                <Input
                  id={id}
                  type="number"
                  inputMode="decimal"
                  name={field.name}
                  value={String(field.value ?? "")}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  ref={field.ref}
                  {...aria}
                />
              )}
            </FormField>
          </FieldGroup>
        </form>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={generate.isPending}>
            Cancel
          </Button>
          <Button type="submit" form="generate-bills" disabled={generate.isPending}>
            {generate.isPending ? <Spinner /> : <FilePlus2 />} Generate
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

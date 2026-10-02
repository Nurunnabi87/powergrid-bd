"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Save } from "lucide-react";
import { useForm, type Resolver } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";
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
import { FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { useRelationOptions, type RelationKey } from "@/components/admin/network/use-relation-options";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { api } from "@/lib/api/client";
import { humanize } from "@/lib/format";
import { queryKeys } from "@/lib/query/keys";

export type FieldSpec =
  | { name: string; label: string; kind: "text" | "number"; placeholder?: string; description?: string; createOnly?: boolean }
  | { name: string; label: string; kind: "enum"; options: readonly string[]; description?: string; createOnly?: boolean }
  | { name: string; label: string; kind: "relation"; relation: RelationKey; description?: string; createOnly?: boolean };

type FormInput = Record<string, string>;
type FormOutput = Record<string, unknown>;

interface ResourceFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  endpoint: string;
  noun: string;
  fields: FieldSpec[];
  schema: z.ZodType<FormOutput>;
  defaults: FormInput;
  /** When set, the dialog edits this record and sends only changed fields. */
  editing?: { id: string; values: FormInput } | null;
}

function RelationSelect({ relation, value, onChange, id, aria }: {
  relation: RelationKey;
  value: string;
  onChange: (value: string) => void;
  id: string;
  aria: { "aria-invalid": boolean; "aria-describedby"?: string };
}) {
  const options = useRelationOptions(relation);
  return (
    <Select value={value} onValueChange={onChange} disabled={options.isPending}>
      <SelectTrigger id={id} className="w-full" {...aria}>
        <SelectValue placeholder={options.isPending ? "Loading…" : "Choose…"} />
      </SelectTrigger>
      <SelectContent>
        {(options.data ?? []).map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

/**
 * Create / edit dialog driven by a field list and the resource's Zod
 * schema. Server-side field errors (e.g. duplicate code → 409) are shown
 * on the matching input.
 */
export function ResourceFormDialog({
  open,
  onOpenChange,
  endpoint,
  noun,
  fields,
  schema,
  defaults,
  editing,
}: ResourceFormDialogProps) {
  const isEdit = Boolean(editing);
  const form = useForm<FormInput, unknown, FormOutput>({
    // Every input is a string in the form; the schema coerces numbers. The
    // configs hold concretely-typed schemas, so the input side is restated.
    resolver: zodResolver(schema as unknown as z.ZodType<FormOutput, FormInput>) as Resolver<FormInput, unknown, FormOutput>,
    defaultValues: defaults,
    mode: "onTouched",
  });

  // Reload the form whenever a different record is opened.
  useEffect(() => {
    if (open) form.reset(editing?.values ?? defaults);
  }, [open, editing, defaults, form]);

  const save = useApiMutation<unknown, FormOutput, FormInput>({
    mutationFn: (values) => {
      if (!editing) return api.post(endpoint, values);
      const dirty = form.formState.dirtyFields;
      const changed = Object.fromEntries(Object.entries(values).filter(([key]) => dirty[key]));
      return api.patch(`${endpoint}/${editing.id}`, changed);
    },
    setError: form.setError,
    invalidate: [queryKeys.network.all],
    successMessage: `${humanize(noun)} ${isEdit ? "updated" : "created"}`,
    onSuccess: () => onOpenChange(false),
  });

  const onSubmit = (values: FormOutput) => {
    if (isEdit && !form.formState.isDirty) {
      toast.info("No changes to save");
      return;
    }
    save.mutate(values);
  };

  const visible = fields.filter((field) => !(isEdit && field.createOnly));

  return (
    <Dialog open={open} onOpenChange={(next) => !save.isPending && onOpenChange(next)}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit" : "Add"} {noun}
          </DialogTitle>
          <DialogDescription>
            {isEdit ? "Only the fields you change are sent." : `Create a new ${noun} in the distribution network.`}
          </DialogDescription>
        </DialogHeader>

        <form id={`resource-${noun}`} onSubmit={form.handleSubmit(onSubmit)} noValidate>
          <FieldGroup>
            {visible.map((spec) => (
              <FormField key={spec.name} control={form.control} name={spec.name} label={spec.label} description={spec.description}>
                {({ field, id, aria }) =>
                  spec.kind === "enum" ? (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id={id} className="w-full" {...aria}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {spec.options.map((option) => (
                          <SelectItem key={option} value={option}>
                            {humanize(option)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : spec.kind === "relation" ? (
                    <RelationSelect relation={spec.relation} value={field.value} onChange={field.onChange} id={id} aria={aria} />
                  ) : (
                    <Input
                      id={id}
                      type={spec.kind === "number" ? "number" : "text"}
                      inputMode={spec.kind === "number" ? "decimal" : undefined}
                      step="any"
                      placeholder={spec.placeholder}
                      {...field}
                      {...aria}
                    />
                  )
                }
              </FormField>
            ))}
          </FieldGroup>
        </form>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={save.isPending}>
            Cancel
          </Button>
          <Button type="submit" form={`resource-${noun}`} disabled={save.isPending}>
            {save.isPending ? <Spinner /> : <Save />} {isEdit ? "Save changes" : `Create ${noun}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

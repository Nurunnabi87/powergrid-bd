"use client";

import { useId, type ReactNode } from "react";
import {
  Controller,
  type Control,
  type ControllerRenderProps,
  type FieldPath,
  type FieldValues,
} from "react-hook-form";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";

interface FormFieldProps<
  TValues extends FieldValues,
  TName extends FieldPath<TValues>,
  TTransformed extends FieldValues = TValues,
> {
  /** Supports forms whose schema transforms input (e.g. string → number). */
  control: Control<TValues, unknown, TTransformed>;
  name: TName;
  label: ReactNode;
  description?: ReactNode;
  className?: string;
  orientation?: "vertical" | "horizontal";
  children: (props: {
    field: ControllerRenderProps<TValues, TName>;
    id: string;
    invalid: boolean;
    /** Spread onto the control for accessible error wiring. */
    aria: { "aria-invalid": boolean; "aria-describedby"?: string };
  }) => ReactNode;
}

/**
 * react-hook-form Controller + shadcn Field in one: label, control,
 * description and a live validation message tied together with ARIA.
 */
export function FormField<
  TValues extends FieldValues,
  TName extends FieldPath<TValues>,
  TTransformed extends FieldValues = TValues,
>({
  control,
  name,
  label,
  description,
  className,
  orientation = "vertical",
  children,
}: FormFieldProps<TValues, TName, TTransformed>) {
  const id = useId();
  const errorId = `${id}-error`;
  const descriptionId = `${id}-description`;

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        const invalid = fieldState.invalid;
        const describedBy = [description ? descriptionId : null, invalid ? errorId : null]
          .filter(Boolean)
          .join(" ");

        return (
          <Field data-invalid={invalid} orientation={orientation} className={className}>
            <FieldLabel htmlFor={id}>{label}</FieldLabel>
            {children({
              field,
              id,
              invalid,
              aria: { "aria-invalid": invalid, ...(describedBy && { "aria-describedby": describedBy }) },
            })}
            {description && !invalid && <FieldDescription id={descriptionId}>{description}</FieldDescription>}
            {invalid && <FieldError id={errorId} errors={[fieldState.error]} />}
          </Field>
        );
      }}
    />
  );
}

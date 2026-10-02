"use client";

import { useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { UserPlus } from "lucide-react";
import { useForm } from "react-hook-form";
import { FormField } from "@/components/forms/form-field";
import { PasswordInput } from "@/components/forms/password-input";
import { Button } from "@/components/ui/button";
import { FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { registerAction } from "@/lib/auth/actions";
import { applyActionError } from "@/lib/forms";
import { registerSchema, type RegisterValues } from "@/lib/validations/auth";

const FIELDS = ["name", "email", "phone", "address", "password", "confirmPassword"] as const;

export function RegisterForm() {
  const [isPending, startTransition] = useTransition();

  const form = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", phone: "", address: "", password: "", confirmPassword: "" },
    mode: "onTouched",
  });

  const onSubmit = (values: RegisterValues) =>
    startTransition(async () => {
      const error = await registerAction(values);
      // 409 = email already registered; show it on the email field.
      if (error.status === 409) {
        form.setError("email", { type: "server", message: "An account with this email already exists" });
        return;
      }
      applyActionError(error, form.setError, FIELDS);
    });

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
      <FieldGroup>
        <FormField control={form.control} name="name" label="Full name">
          {({ field, id, aria }) => <Input id={id} autoComplete="name" placeholder="Ayesha Rahman" {...field} {...aria} />}
        </FormField>
        <FormField control={form.control} name="email" label="Email">
          {({ field, id, aria }) => (
            <Input id={id} type="email" autoComplete="email" placeholder="you@example.com" {...field} {...aria} />
          )}
        </FormField>
        <div className="grid gap-5 sm:grid-cols-2">
          <FormField control={form.control} name="phone" label="Mobile (optional)" description="BD number, e.g. 01712345678">
            {({ field, id, aria }) => (
              <Input id={id} type="tel" inputMode="numeric" autoComplete="tel" placeholder="017XXXXXXXX" {...field} {...aria} />
            )}
          </FormField>
          <FormField control={form.control} name="address" label="Address (optional)">
            {({ field, id, aria }) => (
              <Input id={id} autoComplete="street-address" placeholder="House, road, area" {...field} {...aria} />
            )}
          </FormField>
        </div>
        <FormField
          control={form.control}
          name="password"
          label="Password"
          description="At least 8 characters, with a letter and a number."
        >
          {({ field, id, aria }) => <PasswordInput id={id} autoComplete="new-password" {...field} {...aria} />}
        </FormField>
        <FormField control={form.control} name="confirmPassword" label="Confirm password">
          {({ field, id, aria }) => <PasswordInput id={id} autoComplete="new-password" {...field} {...aria} />}
        </FormField>
        <Button type="submit" size="lg" className="w-full" disabled={isPending}>
          {isPending ? <Spinner /> : <UserPlus />}
          {isPending ? "Creating account…" : "Create account"}
        </Button>
      </FieldGroup>
    </form>
  );
}

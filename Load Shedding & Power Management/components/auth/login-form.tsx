"use client";

import { useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { LockKeyhole } from "lucide-react";
import { useForm } from "react-hook-form";
import { FormField } from "@/components/forms/form-field";
import { PasswordInput } from "@/components/forms/password-input";
import { Button } from "@/components/ui/button";
import { FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { loginAction } from "@/lib/auth/actions";
import { applyActionError } from "@/lib/forms";
import { loginSchema, type LoginValues } from "@/lib/validations/auth";

export function LoginForm({ next }: { next: string | null }) {
  const [isPending, startTransition] = useTransition();

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
    mode: "onTouched",
  });

  const onSubmit = (values: LoginValues) =>
    startTransition(async () => {
      // On success the action redirects; it only returns on failure.
      const error = await loginAction(values, next);
      if (error.status === 401) {
        form.setError("password", { type: "server", message: error.message });
        return;
      }
      applyActionError(error, form.setError, ["email", "password"]);
    });

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
      <FieldGroup>
        <FormField control={form.control} name="email" label="Email">
          {({ field, id, aria }) => (
            <Input id={id} type="email" autoComplete="email" placeholder="you@example.com" {...field} {...aria} />
          )}
        </FormField>
        <FormField control={form.control} name="password" label="Password">
          {({ field, id, aria }) => (
            <PasswordInput id={id} autoComplete="current-password" placeholder="••••••••" {...field} {...aria} />
          )}
        </FormField>
        <Button type="submit" size="lg" className="w-full" disabled={isPending}>
          {isPending ? <Spinner /> : <LockKeyhole />}
          {isPending ? "Logging in…" : "Login"}
        </Button>
      </FieldGroup>
    </form>
  );
}

"use client";

import { useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { KeyRound } from "lucide-react";
import { useForm } from "react-hook-form";
import { FormField } from "@/components/forms/form-field";
import { PasswordInput } from "@/components/forms/password-input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { FieldGroup } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { changePasswordAction } from "@/lib/auth/actions";
import { applyActionError } from "@/lib/forms";
import { changePasswordSchema, type ChangePasswordValues } from "@/lib/validations/auth";

/** Changing the password signs every session out, including this one. */
export function ChangePasswordForm() {
  const [isPending, startTransition] = useTransition();

  const form = useForm<ChangePasswordValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { oldPassword: "", newPassword: "", confirmPassword: "" },
    mode: "onTouched",
  });

  const onSubmit = (values: ChangePasswordValues) =>
    startTransition(async () => {
      const error = await changePasswordAction(values);
      // Wrong current password comes back as 400/401 without a field.
      if (error.status === 400 || error.status === 401) {
        if (!error.fieldErrors.length) {
          form.setError("oldPassword", { type: "server", message: error.message });
          return;
        }
      }
      applyActionError(error, form.setError, ["oldPassword", "newPassword"]);
    });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Change password</CardTitle>
        <CardDescription>You&apos;ll be signed out everywhere and asked to log in again.</CardDescription>
      </CardHeader>
      <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
        <CardContent>
          <FieldGroup>
            <FormField control={form.control} name="oldPassword" label="Current password">
              {({ field, id, aria }) => <PasswordInput id={id} autoComplete="current-password" {...field} {...aria} />}
            </FormField>
            <FormField
              control={form.control}
              name="newPassword"
              label="New password"
              description="At least 8 characters, with a letter and a number."
            >
              {({ field, id, aria }) => <PasswordInput id={id} autoComplete="new-password" {...field} {...aria} />}
            </FormField>
            <FormField control={form.control} name="confirmPassword" label="Confirm new password">
              {({ field, id, aria }) => <PasswordInput id={id} autoComplete="new-password" {...field} {...aria} />}
            </FormField>
          </FieldGroup>
        </CardContent>
        <CardFooter className="mt-6 justify-end border-t">
          <Button type="submit" variant="outline" disabled={isPending}>
            {isPending ? <Spinner /> : <KeyRound />} Update password
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

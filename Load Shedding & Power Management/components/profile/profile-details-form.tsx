"use client";

import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Save } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { FormField } from "@/components/forms/form-field";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { api } from "@/lib/api/client";
import { profileSchema, type ProfileValues } from "@/lib/validations/profile";
import { useSessionStore } from "@/stores/session-store";
import type { UserProfile } from "@/types/domain";

export function ProfileDetailsForm({ user }: { user: UserProfile }) {
  const router = useRouter();
  const patchUser = useSessionStore((state) => state.patchUser);

  const form = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: user.name, phone: user.phone ?? "", address: user.address ?? "" },
    mode: "onTouched",
  });

  const save = useApiMutation<UserProfile, ProfileValues, ProfileValues>({
    mutationFn: async (values) => {
      // Send only what changed; the API rejects an empty update.
      const dirty = form.formState.dirtyFields;
      const body: Partial<ProfileValues> = {};
      if (dirty.name) body.name = values.name;
      if (dirty.phone && values.phone) body.phone = values.phone;
      if (dirty.address) body.address = values.address;
      return (await api.patch<UserProfile>("/users/me", body)).data;
    },
    setError: form.setError,
    successMessage: "Profile updated",
    onSuccess: (updated) => {
      patchUser({ name: updated.name, phone: updated.phone, address: updated.address });
      form.reset({ name: updated.name, phone: updated.phone ?? "", address: updated.address ?? "" });
      router.refresh();
    },
  });

  const onSubmit = (values: ProfileValues) => {
    if (!form.formState.isDirty) {
      toast.info("Nothing to save — no changes were made");
      return;
    }
    save.mutate(values);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Personal details</CardTitle>
        <CardDescription>Used on your bills and when technicians contact you about an outage.</CardDescription>
      </CardHeader>
      <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
        <CardContent>
          <FieldGroup>
            <FormField control={form.control} name="name" label="Full name">
              {({ field, id, aria }) => <Input id={id} autoComplete="name" {...field} {...aria} />}
            </FormField>
            <Field>
              <FieldLabel htmlFor="profile-email">Email</FieldLabel>
              <Input id="profile-email" value={user.email} disabled readOnly />
              <FieldDescription>Your email is your login and can&apos;t be changed here.</FieldDescription>
            </Field>
            <FormField control={form.control} name="phone" label="Mobile number" description="BD number, e.g. 01712345678">
              {({ field, id, aria }) => <Input id={id} type="tel" inputMode="numeric" autoComplete="tel" {...field} {...aria} />}
            </FormField>
            <FormField control={form.control} name="address" label="Address">
              {({ field, id, aria }) => <Input id={id} autoComplete="street-address" {...field} {...aria} />}
            </FormField>
          </FieldGroup>
        </CardContent>
        <CardFooter className="mt-6 justify-end border-t">
          <Button type="submit" disabled={save.isPending}>
            {save.isPending ? <Spinner /> : <Save />} Save changes
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { MapPin, Save } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { FormField } from "@/components/forms/form-field";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldContent, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Spinner } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { api } from "@/lib/api/client";
import { technicianProfileSchema, type TechnicianProfileValues } from "@/lib/validations/profile";
import { useSessionStore } from "@/stores/session-store";
import type { TechnicianProfile, UserProfile } from "@/types/domain";

/**
 * Availability switch and specialization. Going unavailable stops new
 * dispatches only; jobs already assigned stay with the technician.
 */
export function AvailabilityCard({ profile }: { profile: TechnicianProfile }) {
  const router = useRouter();
  const patchUser = useSessionStore((state) => state.patchUser);

  const form = useForm<TechnicianProfileValues>({
    resolver: zodResolver(technicianProfileSchema),
    defaultValues: { isAvailable: profile.isAvailable, specialization: profile.specialization },
    mode: "onTouched",
  });

  const save = useApiMutation<UserProfile, TechnicianProfileValues, TechnicianProfileValues>({
    mutationFn: async (values) => (await api.patch<UserProfile>("/users/me/technician-profile", values)).data,
    setError: form.setError,
    successMessage: (user) =>
      user.technicianProfile?.isAvailable ? "You're available for new dispatches" : "You won't receive new dispatches",
    onSuccess: (user) => {
      patchUser({ technicianProfile: user.technicianProfile });
      if (user.technicianProfile) {
        form.reset({
          isAvailable: user.technicianProfile.isAvailable,
          specialization: user.technicianProfile.specialization,
        });
      }
      router.refresh();
    },
  });

  const load = Math.round((profile.activeJobCount / profile.maxConcurrentJobs) * 100);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Availability</CardTitle>
        <CardDescription>Controls whether the control room can dispatch new jobs to you.</CardDescription>
      </CardHeader>
      <form onSubmit={form.handleSubmit((values) => save.mutate(values))} noValidate>
        <CardContent className="space-y-6">
          <FieldGroup>
            <Controller
              control={form.control}
              name="isAvailable"
              render={({ field }) => (
                <Field orientation="horizontal" className="rounded-lg border p-4">
                  <FieldContent>
                    <FieldLabel htmlFor="availability-switch">Available for dispatch</FieldLabel>
                    <FieldDescription>Turn off when you&apos;re off shift or unable to take jobs.</FieldDescription>
                  </FieldContent>
                  <Switch id="availability-switch" checked={field.value} onCheckedChange={field.onChange} />
                </Field>
              )}
            />
            <FormField control={form.control} name="specialization" label="Specialization" description="e.g. Line Repair, Transformer Maintenance">
              {({ field, id, aria }) => <Input id={id} {...field} {...aria} />}
            </FormField>
          </FieldGroup>

          <div className="space-y-2 rounded-lg bg-muted/40 p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">Current workload</span>
              <span className="tabular-nums text-muted-foreground">
                {profile.activeJobCount} of {profile.maxConcurrentJobs} jobs
              </span>
            </div>
            <Progress value={load} aria-label="Workload" />
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <MapPin className="size-3.5" aria-hidden />
              {profile.zone ? `Dispatched within ${profile.zone.name} (${profile.zone.code})` : "Can be dispatched to any zone"}
            </p>
          </div>
        </CardContent>
        <CardFooter className="mt-6 justify-end border-t">
          <Button type="submit" disabled={save.isPending || !form.formState.isDirty}>
            {save.isPending ? <Spinner /> : <Save />} Save availability
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

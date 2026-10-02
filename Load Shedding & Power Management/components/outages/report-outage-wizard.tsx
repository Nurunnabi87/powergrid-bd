"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight, Gauge, MapPin, Search, Send } from "lucide-react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { FormField } from "@/components/forms/form-field";
import { ImageUpload } from "@/components/forms/image-upload";
import { Stepper, type StepDef } from "@/components/forms/stepper";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel, FieldLegend, FieldSet } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { StatusBadge } from "@/components/shared/status-badge";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { useDebounce } from "@/hooks/use-debounce";
import { api, uploadWithProgress } from "@/lib/api/client";
import { humanize } from "@/lib/format";
import { queryKeys } from "@/lib/query/keys";
import { cn } from "@/lib/utils";
import { REPORT_STEP_FIELDS, reportOutageSchema, type ReportOutageValues } from "@/lib/validations/outage";
import { OUTAGE_SEVERITIES, type Area, type MyConnection, type Outage, type OutageSeverity } from "@/types/domain";

const STEPS: StepDef[] = [
  { title: "Location", description: "Where is the power out?" },
  { title: "Details", description: "What happened?" },
  { title: "Photo & review", description: "Check and submit" },
];

const SEVERITY_HELP: Record<OutageSeverity, string> = {
  LOW: "A few houses, flickering or low voltage",
  MEDIUM: "A street or building without power",
  HIGH: "A whole neighbourhood is out",
  CRITICAL: "Danger: fallen line, sparks or fire",
};

interface AreaOption {
  id: string;
  name: string;
  code: string;
  feeder: string;
  meta?: string;
}

export function ReportOutageWizard({ connections }: { connections: MyConnection[] }) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [progress, setProgress] = useState<number | null>(null);
  const [areaSearch, setAreaSearch] = useState("");
  const debouncedSearch = useDebounce(areaSearch.trim(), 350);

  // The customer's own meters, de-duplicated by area.
  const myAreas: AreaOption[] = [
    ...new Map(
      connections.map((connection) => [
        connection.area.id,
        {
          id: connection.area.id,
          name: connection.area.name,
          code: connection.area.code,
          feeder: connection.area.feeder.name,
          meta: `Meter ${connection.meterNo}`,
        },
      ])
    ).values(),
  ];
  const [selectedArea, setSelectedArea] = useState<AreaOption | null>(myAreas.length === 1 ? myAreas[0] : null);

  const form = useForm<ReportOutageValues>({
    resolver: zodResolver(reportOutageSchema),
    defaultValues: {
      areaId: myAreas.length === 1 ? myAreas[0].id : "",
      title: "",
      description: "",
      severity: "MEDIUM",
      photo: null,
    },
    mode: "onTouched",
  });

  const areaResults = useQuery({
    queryKey: queryKeys.network.options("areas", { search: debouncedSearch }),
    queryFn: ({ signal }) => api.list<Area>("/areas", { search: debouncedSearch, limit: 8 }, signal),
    enabled: debouncedSearch.length >= 2,
  });

  const submit = useApiMutation<Outage, ReportOutageValues, ReportOutageValues>({
    mutationFn: async (values) => {
      const body = new FormData();
      body.set("areaId", values.areaId);
      body.set("title", values.title);
      body.set("description", values.description);
      body.set("severity", values.severity);
      if (values.photo) body.set("photo", values.photo);
      setProgress(values.photo ? 0 : null);
      const result = await uploadWithProgress<Outage>("/outages/report", body, { onProgress: setProgress });
      return result.data;
    },
    setError: form.setError,
    invalidate: [queryKeys.outages.all],
    successMessage: "Outage reported. The control room has been alerted.",
    onSuccess: (outage) => router.push(`/dashboard/outages/${outage.id}`),
    onError: () => setProgress(null),
  });

  const [title, description, severity, photo] = useWatch({
    control: form.control,
    name: ["title", "description", "severity", "photo"],
  });

  const next = async () => {
    const valid = await form.trigger([...REPORT_STEP_FIELDS[step]]);
    if (valid) setStep((current) => Math.min(current + 1, STEPS.length - 1));
  };

  const chooseArea = (area: AreaOption) => {
    setSelectedArea(area);
    form.setValue("areaId", area.id, { shouldValidate: true, shouldDirty: true });
  };

  const areaCard = (area: AreaOption, icon: typeof Gauge) => {
    const Icon = icon;
    const selected = selectedArea?.id === area.id;
    return (
      <button
        type="button"
        key={area.id}
        onClick={() => chooseArea(area)}
        aria-pressed={selected}
        className={cn(
          "flex w-full items-start gap-3 rounded-xl border p-4 text-left transition-colors hover:bg-muted/50",
          selected && "border-primary bg-primary/5 ring-2 ring-primary/30"
        )}
      >
        <Icon className="mt-0.5 size-5 shrink-0 text-muted-foreground" aria-hidden />
        <span className="min-w-0">
          <span className="block font-medium">
            {area.name} <span className="font-mono text-xs text-muted-foreground">{area.code}</span>
          </span>
          <span className="block text-sm text-muted-foreground">
            {area.feeder}
            {area.meta ? ` · ${area.meta}` : ""}
          </span>
        </span>
      </button>
    );
  };

  const busy = submit.isPending;

  return (
    <Card className="max-w-3xl">
      <CardContent className="space-y-8">
        <Stepper steps={STEPS} current={step} />

        <form
          id="report-outage-form"
          onSubmit={form.handleSubmit((values) => submit.mutate(values))}
          noValidate
          className="space-y-6"
        >
          {step === 0 && (
            <FieldSet>
              <FieldLegend>Where is the power out?</FieldLegend>
              <FieldDescription>Pick one of your meters, or search for another area.</FieldDescription>
              {myAreas.length > 0 && (
                <div className="grid gap-3 sm:grid-cols-2">{myAreas.map((area) => areaCard(area, Gauge))}</div>
              )}
              <Field>
                <FieldLabel htmlFor="area-search">Another area</FieldLabel>
                <div className="relative">
                  <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
                  <Input
                    id="area-search"
                    type="search"
                    value={areaSearch}
                    onChange={(event) => setAreaSearch(event.target.value)}
                    placeholder="Type at least 2 letters, e.g. Gulshan"
                    className="pl-8"
                  />
                </div>
              </Field>
              {debouncedSearch.length >= 2 && (
                <div className="space-y-2" aria-live="polite">
                  {areaResults.isPending ? (
                    <>
                      <Skeleton className="h-16 w-full" />
                      <Skeleton className="h-16 w-full" />
                    </>
                  ) : areaResults.data?.data.length ? (
                    <div className="grid gap-3 sm:grid-cols-2">
                      {areaResults.data.data.map((area) =>
                        areaCard(
                          {
                            id: area.id,
                            name: area.name,
                            code: area.code,
                            feeder: area.feeder.name,
                            meta: area.feeder.substation.zone.name,
                          },
                          MapPin
                        )
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No areas match “{debouncedSearch}”.</p>
                  )}
                </div>
              )}
              {form.formState.errors.areaId && <FieldError errors={[form.formState.errors.areaId]} />}
            </FieldSet>
          )}

          {step === 1 && (
            <FieldGroup>
              <FormField control={form.control} name="title" label="Short title" description="e.g. No power on Road 11 since 3 PM">
                {({ field, id, aria }) => <Input id={id} maxLength={150} {...field} {...aria} />}
              </FormField>
              <FormField
                control={form.control}
                name="description"
                label="What happened?"
                description={`${description.length}/1000 — include landmarks, what you saw or heard, and whether neighbours are affected.`}
              >
                {({ field, id, aria }) => <Textarea id={id} rows={5} maxLength={1000} {...field} {...aria} />}
              </FormField>
              <Controller
                control={form.control}
                name="severity"
                render={({ field, fieldState }) => (
                  <FieldSet data-invalid={fieldState.invalid}>
                    <FieldLegend variant="label">How serious is it?</FieldLegend>
                    <div role="radiogroup" aria-label="Severity" className="grid gap-2 sm:grid-cols-2">
                      {OUTAGE_SEVERITIES.map((level) => (
                        <button
                          key={level}
                          type="button"
                          role="radio"
                          aria-checked={field.value === level}
                          onClick={() => field.onChange(level)}
                          className={cn(
                            "flex flex-col items-start gap-1 rounded-xl border p-3 text-left transition-colors hover:bg-muted/50",
                            field.value === level && "border-primary bg-primary/5 ring-2 ring-primary/30"
                          )}
                        >
                          <StatusBadge status={level} kind="scale" />
                          <span className="text-sm text-muted-foreground">{SEVERITY_HELP[level]}</span>
                        </button>
                      ))}
                    </div>
                    {fieldState.error && <FieldError errors={[fieldState.error]} />}
                  </FieldSet>
                )}
              />
            </FieldGroup>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <Controller
                control={form.control}
                name="photo"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>Photo (optional)</FieldLabel>
                    <ImageUpload
                      value={field.value}
                      onChange={(file) => {
                        field.onChange(file);
                        void form.trigger("photo");
                      }}
                      progress={progress}
                      invalid={fieldState.invalid}
                      disabled={busy}
                      label="Add a photo of the fault"
                    />
                    {fieldState.error && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />

              <div className="space-y-3 rounded-xl border bg-muted/30 p-4">
                <p className="text-sm font-semibold">Review your report</p>
                <dl className="grid gap-3 text-sm sm:grid-cols-[8rem_1fr]">
                  <dt className="text-muted-foreground">Area</dt>
                  <dd>{selectedArea ? `${selectedArea.name} · ${selectedArea.feeder}` : "—"}</dd>
                  <dt className="text-muted-foreground">Title</dt>
                  <dd>{title}</dd>
                  <dt className="text-muted-foreground">Severity</dt>
                  <dd>{humanize(severity)}</dd>
                  <dt className="text-muted-foreground">Description</dt>
                  <dd className="whitespace-pre-line">{description}</dd>
                  <dt className="text-muted-foreground">Photo</dt>
                  <dd>{photo ? photo.name : "None"}</dd>
                </dl>
              </div>
            </div>
          )}
        </form>
      </CardContent>

      <CardFooter className="flex justify-between gap-2 border-t">
        <Button type="button" variant="outline" onClick={() => setStep((current) => current - 1)} disabled={step === 0 || busy}>
          <ArrowLeft /> Back
        </Button>
        {step < STEPS.length - 1 ? (
          <Button type="button" onClick={next}>
            Continue <ArrowRight />
          </Button>
        ) : (
          <Button type="submit" form="report-outage-form" disabled={busy}>
            {busy ? <Spinner /> : <Send />}
            {busy ? "Submitting…" : "Submit report"}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  ArrowRight,
  CalendarCheck,
  Cable,
  CircleCheck,
  MapPinned,
  RotateCcw,
  ShieldCheck,
  TriangleAlert,
  Users,
  Wand2,
  Zap,
} from "lucide-react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { FormField } from "@/components/forms/form-field";
import { Stepper, type StepDef } from "@/components/forms/stepper";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { FieldError, FieldGroup, FieldLegend, FieldSet } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { StatCard } from "@/components/shared/stat-card";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { api } from "@/lib/api/client";
import { formatCalendarDate, formatNumber, formatTime, todayInDhaka } from "@/lib/format";
import { queryKeys } from "@/lib/query/keys";
import { cn } from "@/lib/utils";
import {
  generateSchema,
  type GenerateInput,
  type GenerateValues,
} from "@/lib/validations/schedule";
import type { Feeder, GenerateScheduleResult, Zone } from "@/types/domain";

const STEPS: StepDef[] = [
  { title: "Zone", description: "Where supply is short" },
  { title: "Parameters", description: "Deficit and timing" },
  { title: "Review", description: "Check the plan" },
  { title: "Result", description: "Published slots" },
];

const STEP_FIELDS: (keyof GenerateInput)[][] = [["zoneId"], ["date", "totalDeficitMw", "slotHours", "startHour"], [], []];

/** Bangladesh is UTC+6 with no DST; hours before 06:00 would fall on the previous UTC day. */
const DHAKA_HOURS = Array.from({ length: 18 }, (_, index) => index + 6);
const toUtcHour = (dhakaHour: number) => dhakaHour - 6;

export function GenerateScheduleWizard({ zones }: { zones: Zone[] }) {
  const [step, setStep] = useState(0);
  const [conflict, setConflict] = useState<string | null>(null);
  const [result, setResult] = useState<GenerateScheduleResult | null>(null);

  const form = useForm<GenerateInput, unknown, GenerateValues>({
    resolver: zodResolver(generateSchema),
    defaultValues: { zoneId: "", date: todayInDhaka(), totalDeficitMw: 5, slotHours: 2, startHour: 14 },
    mode: "onTouched",
  });

  const [zoneId, date, deficit, slotHours, startHour] = useWatch({
    control: form.control,
    name: ["zoneId", "date", "totalDeficitMw", "slotHours", "startHour"],
  });
  const zone = zones.find((candidate) => candidate.id === zoneId);

  // The zone's feeders, to show how much load is available to shed.
  const feeders = useQuery({
    queryKey: queryKeys.network.options("feeders", { zoneId }),
    queryFn: ({ signal }) => api.list<Feeder>("/feeders", { zoneId, limit: 100 }, signal),
    enabled: Boolean(zoneId) && step >= 1,
  });
  const feederList = feeders.data?.data ?? [];
  const totalLoadMw = feederList.reduce((sum, feeder) => sum + feeder.loadKw, 0) / 1000;
  const feederName = new Map(feederList.map((feeder) => [feeder.id, `${feeder.name} (${feeder.code})`]));

  const generate = useApiMutation<GenerateScheduleResult, GenerateValues, GenerateInput>({
    mutationFn: async (values) =>
      (
        await api.post<GenerateScheduleResult>("/schedules/generate", {
          zoneId: values.zoneId,
          date: values.date,
          totalDeficitMw: values.totalDeficitMw,
          slotHours: values.slotHours,
          startHour: toUtcHour(values.startHour),
        })
      ).data,
    invalidate: [queryKeys.schedules.all],
    successMessage: (data) => `${data.slotsCreated} load-shedding slot(s) published`,
    onSuccess: (data) => {
      setConflict(null);
      setResult(data);
      setStep(3);
    },
    // 409 (overlap) and 400 (no sheddable feeders) are explained in place.
    onError: (error) => setConflict(error.status === 409 || error.status === 400 ? error.message : null),
  });

  const next = async () => {
    const valid = await form.trigger(STEP_FIELDS[step]);
    if (valid) setStep((current) => current + 1);
  };

  const restart = () => {
    form.reset();
    setResult(null);
    setConflict(null);
    setStep(0);
  };

  return (
    <Card className="max-w-4xl">
      <CardContent className="space-y-8">
        <Stepper steps={STEPS} current={step} />

        <form id="generate-form" onSubmit={form.handleSubmit((values) => generate.mutate(values))} noValidate>
          {step === 0 && (
            <Controller
              control={form.control}
              name="zoneId"
              render={({ field, fieldState }) => (
                <FieldSet data-invalid={fieldState.invalid}>
                  <FieldLegend>Which zone is short of supply?</FieldLegend>
                  <div role="radiogroup" aria-label="Zone" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {zones.map((candidate) => (
                      <button
                        key={candidate.id}
                        type="button"
                        role="radio"
                        aria-checked={field.value === candidate.id}
                        onClick={() => field.onChange(candidate.id)}
                        className={cn(
                          "flex items-start gap-3 rounded-xl border p-4 text-left transition-colors hover:bg-muted/50",
                          field.value === candidate.id && "border-primary bg-primary/5 ring-2 ring-primary/30"
                        )}
                      >
                        <MapPinned className="mt-0.5 size-5 shrink-0 text-muted-foreground" aria-hidden />
                        <span>
                          <span className="block font-medium">{candidate.name}</span>
                          <span className="block text-sm text-muted-foreground">
                            {candidate.code} · {candidate.city} · {candidate._count.substations} substations
                          </span>
                        </span>
                      </button>
                    ))}
                  </div>
                  {fieldState.error && <FieldError errors={[fieldState.error]} />}
                </FieldSet>
              )}
            />
          )}

          {step === 1 && (
            <div className="grid gap-8 lg:grid-cols-[1fr_18rem]">
              <FieldGroup>
                <FormField control={form.control} name="date" label="Date">
                  {({ field, id, aria }) => <Input id={id} type="date" min={todayInDhaka()} {...field} {...aria} />}
                </FormField>
                <FormField
                  control={form.control}
                  name="totalDeficitMw"
                  label="Supply deficit (MW)"
                  description="How much load must be shed to balance supply."
                >
                  {({ field, id, aria }) => (
                    <Input
                      id={id}
                      type="number"
                      inputMode="decimal"
                      min={0.1}
                      max={10000}
                      step={0.1}
                      name={field.name}
                      value={String(field.value ?? "")}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      ref={field.ref}
                      {...aria}
                    />
                  )}
                </FormField>
                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="slotHours" label="Slot length">
                    {({ field, id, aria }) => (
                      <Select value={String(field.value)} onValueChange={(value) => field.onChange(Number(value))}>
                        <SelectTrigger id={id} className="w-full" {...aria}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 12 }, (_, index) => index + 1).map((hours) => (
                            <SelectItem key={hours} value={String(hours)}>
                              {hours} hour{hours > 1 ? "s" : ""}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </FormField>
                  <FormField control={form.control} name="startHour" label="First slot starts">
                    {({ field, id, aria }) => (
                      <Select value={String(field.value)} onValueChange={(value) => field.onChange(Number(value))}>
                        <SelectTrigger id={id} className="w-full" {...aria}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {DHAKA_HOURS.map((hour) => (
                            <SelectItem key={hour} value={String(hour)}>
                              {`${String(hour).padStart(2, "0")}:00`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </FormField>
                </div>
              </FieldGroup>

              <aside className="space-y-3 rounded-xl border bg-muted/30 p-4 text-sm">
                <p className="font-semibold">{zone?.name}</p>
                {feeders.isPending ? (
                  <Skeleton className="h-16 w-full" />
                ) : (
                  <>
                    <p className="flex items-center gap-2 text-muted-foreground">
                      <Cable className="size-4" aria-hidden /> {feederList.length} feeders
                    </p>
                    <p className="flex items-center gap-2 text-muted-foreground">
                      <Zap className="size-4" aria-hidden /> {formatNumber(totalLoadMw, 1)} MW connected load
                    </p>
                  </>
                )}
                <p className="flex gap-2 text-xs text-muted-foreground">
                  <ShieldCheck className="size-4 shrink-0 text-success" aria-hidden />
                  Feeders serving a CRITICAL area are never shed. LOW-priority feeders go first, then NORMAL, then HIGH.
                </p>
              </aside>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              {conflict && (
                <Alert variant="destructive">
                  <TriangleAlert />
                  <AlertTitle>Can&apos;t generate this schedule</AlertTitle>
                  <AlertDescription>{conflict}</AlertDescription>
                </Alert>
              )}
              <dl className="grid gap-4 rounded-xl border p-4 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  { label: "Zone", value: zone ? `${zone.name} (${zone.code})` : "—" },
                  { label: "Date", value: date ? formatCalendarDate(date) : "—" },
                  { label: "Deficit to cover", value: `${deficit} MW` },
                  {
                    label: "Slots",
                    value: `${slotHours}h each, from ${String(startHour).padStart(2, "0")}:00`,
                  },
                ].map((item) => (
                  <div key={item.label}>
                    <dt className="text-xs text-muted-foreground">{item.label}</dt>
                    <dd className="font-medium">{item.value}</dd>
                  </div>
                ))}
              </dl>
              {Number(deficit) > totalLoadMw && totalLoadMw > 0 && (
                <Alert>
                  <TriangleAlert />
                  <AlertTitle>Deficit exceeds sheddable load</AlertTitle>
                  <AlertDescription>
                    The zone&apos;s feeders carry {formatNumber(totalLoadMw, 1)} MW in total. Every non-critical feeder will be shed and the
                    deficit may not be fully covered.
                  </AlertDescription>
                </Alert>
              )}
              <p className="text-sm text-muted-foreground">
                Publishing notifies every customer on the affected feeders immediately.
              </p>
            </div>
          )}

          {step === 3 && result && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 rounded-xl border border-success/30 bg-success/5 p-4">
                <CircleCheck className="size-6 shrink-0 text-success" aria-hidden />
                <p>
                  <span className="font-semibold">{result.slotsCreated} slots published</span> for {result.zone} on{" "}
                  {formatCalendarDate(result.date)}.
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard label="Covered" value={`${formatNumber(result.coveredLoadMw, 2)} MW`} icon={Zap} accent="primary" hint={`of ${result.requestedDeficitMw} MW requested`} />
                <StatCard label="Slots" value={result.slotsCreated} icon={CalendarCheck} accent="info" />
                <StatCard label="Feeders protected" value={result.feedersProtected} icon={ShieldCheck} accent="success" hint="Serve critical sites" />
                <StatCard label="Customers notified" value={formatNumber(result.customersNotified)} icon={Users} accent="warning" />
              </div>
              <ul className="divide-y rounded-xl border">
                {result.schedules.map((slot) => (
                  <li key={slot.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm">
                    <span className="font-medium">{feederName.get(slot.feederId) ?? "Feeder"}</span>
                    <span className="font-mono tabular-nums">
                      {formatTime(slot.startTime)} – {formatTime(slot.endTime)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </form>
      </CardContent>

      <CardFooter className="flex justify-between gap-2 border-t">
        {step < 3 ? (
          <>
            <Button variant="outline" onClick={() => setStep((current) => current - 1)} disabled={step === 0 || generate.isPending}>
              <ArrowLeft /> Back
            </Button>
            {step < 2 ? (
              <Button onClick={next}>
                Continue <ArrowRight />
              </Button>
            ) : (
              <Button type="submit" form="generate-form" disabled={generate.isPending}>
                {generate.isPending ? <Spinner /> : <Wand2 />} Generate & publish
              </Button>
            )}
          </>
        ) : (
          <>
            <Button variant="outline" onClick={restart}>
              <RotateCcw /> Generate another
            </Button>
            <Button asChild>
              <Link href={`/admin/schedules?date=${result?.date.slice(0, 10) ?? ""}`}>View schedule</Link>
            </Button>
          </>
        )}
      </CardFooter>
    </Card>
  );
}

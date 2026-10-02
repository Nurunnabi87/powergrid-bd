import { Ban, Check, CircleDot, ClipboardCheck, HardHat, PlugZap, TriangleAlert, Wrench, type LucideIcon } from "lucide-react";
import { formatDateTime, formatMinutes } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Outage, OutageStatus } from "@/types/domain";

interface Step {
  status: OutageStatus;
  title: string;
  icon: LucideIcon;
  time: (outage: Outage) => string | null | undefined;
  detail?: (outage: Outage) => string | null;
}

const STEPS: Step[] = [
  { status: "REPORTED", title: "Reported", icon: TriangleAlert, time: (o) => o.reportedAt, detail: (o) => (o.reportedBy ? `By ${o.reportedBy.name}` : null) },
  { status: "ACKNOWLEDGED", title: "Acknowledged", icon: ClipboardCheck, time: (o) => o.acknowledgedAt, detail: () => "Verified by the control room" },
  {
    status: "ASSIGNED",
    title: "Technician assigned",
    icon: HardHat,
    time: (o) => o.assignments[0]?.assignedAt,
    detail: (o) => (o.assignments[0] ? o.assignments[0].technician.name : null),
  },
  { status: "IN_PROGRESS", title: "Repair in progress", icon: Wrench, time: (o) => o.assignments[0]?.acceptedAt, detail: () => "Technician on site" },
  {
    status: "RESOLVED",
    title: "Power restored",
    icon: PlugZap,
    time: (o) => o.restoredAt ?? o.resolvedAt,
    detail: (o) => (o.downtimeMinutes !== null ? `Total downtime ${formatMinutes(o.downtimeMinutes)}` : null),
  },
  { status: "CLOSED", title: "Closed", icon: Check, time: () => null, detail: () => "Verified and archived" },
];

const ORDER: OutageStatus[] = ["REPORTED", "ACKNOWLEDGED", "ASSIGNED", "IN_PROGRESS", "RESOLVED", "CLOSED"];

/**
 * Vertical stepper for the outage lifecycle. A report may skip
 * "Acknowledged" (direct dispatch), so steps are marked done by position in
 * the lifecycle rather than by having a timestamp.
 */
export function OutageTimeline({ outage }: { outage: Outage }) {
  const cancelled = outage.status === "CANCELLED";
  const currentIndex = cancelled ? -1 : ORDER.indexOf(outage.status);

  return (
    <ol className="relative space-y-6">
      {STEPS.map((step, index) => {
        const done = !cancelled && index <= currentIndex;
        const current = !cancelled && index === currentIndex;
        const time = step.time(outage);
        const detail = done ? step.detail?.(outage) : null;
        const skipped = done && !time && step.status === "ACKNOWLEDGED";

        return (
          <li key={step.status} className="relative flex gap-4">
            {index < STEPS.length - 1 && (
              <span
                aria-hidden
                className={cn("absolute top-9 left-[1.0625rem] h-[calc(100%-0.75rem)] w-0.5", done && index < currentIndex ? "bg-primary" : "bg-border")}
              />
            )}
            <span
              className={cn(
                "relative z-10 flex size-9 shrink-0 items-center justify-center rounded-full border-2",
                done ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background text-muted-foreground",
                current && "ring-4 ring-primary/25"
              )}
            >
              <step.icon className="size-4" aria-hidden />
            </span>
            <div className="min-w-0 pt-1">
              <p className={cn("font-medium", !done && "text-muted-foreground")}>
                {step.title}
                {current && <span className="sr-only"> (current status)</span>}
              </p>
              {done && time && <p className="text-sm text-muted-foreground">{formatDateTime(time)}</p>}
              {skipped && <p className="text-sm text-muted-foreground">Dispatched directly</p>}
              {detail && <p className="text-sm text-muted-foreground">{detail}</p>}
            </div>
          </li>
        );
      })}
      {cancelled && (
        <li className="flex gap-4">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full border-2 border-destructive bg-destructive/10 text-destructive">
            <Ban className="size-4" aria-hidden />
          </span>
          <div className="pt-1">
            <p className="font-medium text-destructive">Cancelled</p>
            <p className="text-sm text-muted-foreground">{outage.resolutionNote ?? "This report was closed without a repair."}</p>
          </div>
        </li>
      )}
    </ol>
  );
}

/** Compact current-stage indicator for list rows. */
export function OutageProgress({ status }: { status: OutageStatus }) {
  if (status === "CANCELLED") return null;
  const index = ORDER.indexOf(status);
  return (
    <div className="flex items-center gap-1" aria-label={`Stage ${index + 1} of ${ORDER.length}`}>
      {ORDER.map((step, i) => (
        <span key={step} className={cn("h-1.5 w-4 rounded-full", i <= index ? "bg-primary" : "bg-border")} />
      ))}
      <CircleDot className="sr-only" />
    </div>
  );
}

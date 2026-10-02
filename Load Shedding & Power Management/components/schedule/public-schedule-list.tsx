import { Clock, ShieldCheck } from "lucide-react";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatTime } from "@/lib/format";
import type { PublicSchedule } from "@/types/domain";

/**
 * Published load-shedding slots as cards (readable on phones, where a wide
 * table would not fit). Server component: no interactivity needed.
 */
export function PublicScheduleList({ schedules }: { schedules: PublicSchedule[] }) {
  return (
    <ul className="grid gap-3 md:grid-cols-2">
      {schedules.map((slot) => {
        const shed = slot.feeder.areas.filter((area) => area.priorityTier !== "CRITICAL");
        const protectedAreas = slot.feeder.areas.length - shed.length;
        return (
          <li key={slot.id} className="flex flex-col gap-3 rounded-xl border bg-card p-4">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="font-medium">
                  {slot.feeder.name} <span className="font-mono text-xs text-muted-foreground">{slot.feeder.code}</span>
                </p>
                <p className="text-sm text-muted-foreground">
                  {slot.feeder.substation.zone.name} · {slot.feeder.substation.name} · {slot.feeder.voltageLevel}
                </p>
              </div>
              <StatusBadge status={slot.status} label={slot.status === "ACTIVE" ? "Shedding now" : undefined} />
            </div>
            <p className="flex items-center gap-2 font-mono text-lg font-semibold tabular-nums">
              <Clock className="size-4 text-muted-foreground" aria-hidden />
              {formatTime(slot.startTime)} – {formatTime(slot.endTime)}
            </p>
            {shed.length > 0 && (
              <p className="text-sm">
                <span className="text-muted-foreground">Areas affected: </span>
                {shed.map((area) => area.name).join(", ")}
              </p>
            )}
            {protectedAreas > 0 && (
              <p className="flex items-center gap-1.5 text-xs text-success">
                <ShieldCheck className="size-3.5" aria-hidden />
                {protectedAreas} critical site{protectedAreas > 1 ? "s" : ""} on this feeder kept online
              </p>
            )}
            {slot.reason && <p className="text-xs text-muted-foreground">Reason: {slot.reason}</p>}
          </li>
        );
      })}
    </ul>
  );
}

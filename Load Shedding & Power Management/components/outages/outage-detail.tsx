import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Cable, Clock, MapPin, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { OutageTimeline } from "@/components/outages/outage-timeline";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatDateTime, formatMinutes, formatNumber, humanize } from "@/lib/format";
import type { Outage } from "@/types/domain";

interface OutageDetailProps {
  outage: Outage;
  backHref: string;
  backLabel: string;
  /** Role-specific controls (dispatch, status updates, restore). */
  actions?: ReactNode;
}

/** Read-only outage record shared by the customer, technician and admin views. */
export function OutageDetail({ outage, backHref, backLabel, actions }: OutageDetailProps) {
  const facts = [
    { icon: MapPin, label: "Area", value: `${outage.area.name} (${outage.area.code})` },
    { icon: Cable, label: "Feeder", value: `${outage.area.feeder.name} · ${outage.area.feeder.substation.name}` },
    { icon: Users, label: "Customers affected", value: formatNumber(outage.affectedCustomers) },
    {
      icon: Clock,
      label: "Downtime",
      value: outage.downtimeMinutes !== null ? formatMinutes(outage.downtimeMinutes) : "Ongoing",
    },
  ];

  return (
    <>
      <div className="space-y-4">
        <Button variant="ghost" size="sm" className="-ml-2" asChild>
          <Link href={backHref}>
            <ArrowLeft /> {backLabel}
          </Link>
        </Button>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={outage.status} />
              <StatusBadge status={outage.severity} kind="scale" label={`${humanize(outage.severity)} severity`} />
              <StatusBadge status={outage.area.priorityTier} kind="scale" label={`${humanize(outage.area.priorityTier)} priority area`} dot={false} />
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-balance sm:text-3xl">{outage.title}</h1>
            <p className="text-sm text-muted-foreground">
              {humanize(outage.type)} outage · reported {formatDateTime(outage.reportedAt)}
              {outage.reportedBy ? ` by ${outage.reportedBy.name}` : ""}
            </p>
          </div>
          {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="whitespace-pre-line">{outage.description}</p>
              <dl className="grid gap-4 sm:grid-cols-2">
                {facts.map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex gap-3 rounded-lg border p-3">
                    <Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
                    <div className="min-w-0">
                      <dt className="text-xs text-muted-foreground">{label}</dt>
                      <dd className="font-medium">{value}</dd>
                    </div>
                  </div>
                ))}
              </dl>
              {outage.photoUrl && (
                <figure className="space-y-2">
                  <div className="relative aspect-video overflow-hidden rounded-lg border bg-muted">
                    <Image
                      src={outage.photoUrl}
                      alt={`Photo submitted with the report "${outage.title}"`}
                      fill
                      sizes="(min-width: 1024px) 50vw, 100vw"
                      className="object-cover"
                    />
                  </div>
                  <figcaption className="text-xs text-muted-foreground">Photo submitted with the report</figcaption>
                </figure>
              )}
              {outage.resolutionNote && (
                <div className="rounded-lg border border-success/30 bg-success/5 p-4">
                  <p className="text-sm font-medium">Resolution note</p>
                  <p className="text-sm text-muted-foreground">{outage.resolutionNote}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {outage.assignments.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Dispatch history</CardTitle>
                <CardDescription>Technicians assigned to this outage</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="divide-y">
                  {outage.assignments.map((assignment) => (
                    <li key={assignment.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                      <div>
                        <p className="font-medium">{assignment.technician.name}</p>
                        <p className="text-xs text-muted-foreground">
                          Assigned {formatDateTime(assignment.assignedAt)}
                          {assignment.assignedBy ? ` by ${assignment.assignedBy.name}` : ""}
                          {assignment.technician.phone ? ` · ${assignment.technician.phone}` : ""}
                        </p>
                        {assignment.notes && <p className="mt-1 text-sm text-muted-foreground">“{assignment.notes}”</p>}
                      </div>
                      <StatusBadge status={assignment.status} />
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>

        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Progress</CardTitle>
            <CardDescription>Where this outage is in its lifecycle</CardDescription>
          </CardHeader>
          <CardContent>
            <OutageTimeline outage={outage} />
          </CardContent>
        </Card>
      </div>
    </>
  );
}

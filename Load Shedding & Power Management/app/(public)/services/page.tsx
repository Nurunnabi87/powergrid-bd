import type { Metadata } from "next";
import Link from "next/link";
import {
  BarChart3,
  BellRing,
  CalendarClock,
  CreditCard,
  FileClock,
  HardHat,
  Network,
  Route,
  Siren,
  Wand2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHero, Section } from "@/components/marketing/section";
import { StatusBadge } from "@/components/shared/status-badge";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Load-shedding schedules, outage reporting with photos, technician dispatch, restoration tracking, notifications and online bill payment by card or bKash.",
  alternates: { canonical: "/services" },
};

const SERVICES = [
  {
    icon: CalendarClock,
    title: "Published load-shedding schedules",
    text: "See each feeder's slots for any date, and your own meter's upcoming slots once you sign in.",
  },
  {
    icon: Siren,
    title: "Outage reporting",
    text: "Report a fault in your area with a title, severity and optional photo. Affected customers are counted automatically.",
  },
  {
    icon: Route,
    title: "Technician dispatch",
    text: "Operators assign the report to an available technician in the same zone, with live workload shown before dispatch.",
  },
  {
    icon: FileClock,
    title: "Restoration tracking",
    text: "Follow your report from Reported to Restored. Downtime is recorded and the whole area is told when power is back.",
  },
  {
    icon: BellRing,
    title: "Notifications",
    text: "In-app alerts for new schedules, outage progress, restoration and payment receipts.",
  },
  {
    icon: CreditCard,
    title: "Online bill payment",
    text: "Pay monthly bills by card through Stripe Checkout or with a bKash wallet. Every payment is verified with the gateway before the bill is marked paid.",
  },
];

const OPERATIONS = [
  {
    icon: Wand2,
    title: "Automatic schedule generation",
    text: "Enter a zone's supply deficit in MW; feeders are shed LOW → NORMAL → HIGH until it is covered, never touching CRITICAL areas.",
  },
  {
    icon: Network,
    title: "Network management",
    text: "Maintain zones, substations, feeders, areas and customer connections with safe, reversible deletes.",
  },
  {
    icon: HardHat,
    title: "Field workforce",
    text: "Technicians see only their own jobs, set their availability and track their restoration record.",
  },
  {
    icon: BarChart3,
    title: "Analytics & audit",
    text: "Restoration times, worst-affected areas, shedding hours per zone, revenue, and a full audit trail of every change.",
  },
];

const PRIORITY = [
  { tier: "CRITICAL", text: "Hospitals, water pumping — never shed" },
  { tier: "HIGH", text: "Shed only as a last resort" },
  { tier: "NORMAL", text: "Most residential areas" },
  { tier: "LOW", text: "Shed first when supply is short" },
];

export default function ServicesPage() {
  return (
    <>
      <PageHero
        eyebrow="Services"
        title="Everything between the power station and your switch"
        description="Customer self-service, field operations and control-room tooling on a single, consistent platform."
      />

      <Section eyebrow="For customers" title="Stay informed and in control">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map(({ icon: Icon, title, text }) => (
            <div key={title} className="rounded-xl border bg-card p-6">
              <span className="mb-4 flex size-10 items-center justify-center rounded-lg bg-primary/15 text-[color-mix(in_oklch,var(--primary),black_40%)] dark:text-primary">
                <Icon className="size-5" aria-hidden />
              </span>
              <h3 className="font-semibold">{title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{text}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section eyebrow="For the utility" title="Operations tooling" className="border-y bg-muted/30">
        <div className="grid gap-4 md:grid-cols-2">
          {OPERATIONS.map(({ icon: Icon, title, text }) => (
            <div key={title} className="flex gap-4 rounded-xl border bg-card p-6">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-secondary">
                <Icon className="size-5" aria-hidden />
              </span>
              <div>
                <h3 className="font-semibold">{title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{text}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section
        eyebrow="Priority tiers"
        title="Who gets shed, and in what order"
        description="Every area carries a priority tier. A feeder inherits the most protective tier of the areas it serves."
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {PRIORITY.map(({ tier, text }) => (
            <div key={tier} className="space-y-2 rounded-xl border bg-card p-5">
              <StatusBadge status={tier} kind="scale" />
              <p className="text-sm text-muted-foreground">{text}</p>
            </div>
          ))}
        </div>
        <Button className="mt-8" asChild>
          <Link href="/schedule">
            <CalendarClock /> See today&apos;s schedule
          </Link>
        </Button>
      </Section>
    </>
  );
}

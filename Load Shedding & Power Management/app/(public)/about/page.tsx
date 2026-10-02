import type { Metadata } from "next";
import { Building2, Cable, Factory, Home, MapPinned, ShieldCheck, Scale, Eye, Timer } from "lucide-react";
import { PageHero, Section } from "@/components/marketing/section";
import { publicGet } from "@/lib/api/server";
import { formatNumber } from "@/lib/format";
import type { PublicStats } from "@/types/domain";

export const metadata: Metadata = {
  title: "About",
  description:
    "PowerGrid BD models the national distribution network — zones, substations, feeders and areas — to make load shedding fair, predictable and transparent.",
  alternates: { canonical: "/about" },
};

export const revalidate = 600;

const PRINCIPLES = [
  {
    icon: ShieldCheck,
    title: "Critical sites first",
    text: "Areas tagged CRITICAL — hospitals, water pumping stations — are structurally excluded from shedding. The generator refuses to schedule any feeder that serves one.",
  },
  {
    icon: Scale,
    title: "Fair, priority-based shedding",
    text: "When supply falls short, LOW-priority feeders are shed first, then NORMAL, then HIGH, in consecutive slots until the deficit is covered.",
  },
  {
    icon: Eye,
    title: "Transparent to the public",
    text: "Every slot is published before it starts, and every outage moves through an audited lifecycle that customers can follow.",
  },
  {
    icon: Timer,
    title: "Measured restoration",
    text: "Downtime is recorded at restoration, so average time-to-restore is tracked per area, per technician and per month.",
  },
];

export default async function AboutPage() {
  const stats = (await publicGet<PublicStats>("/public/stats", undefined, 600))?.data;

  const hierarchy = [
    { icon: MapPinned, title: "Distribution zones", text: "Regional operating areas such as Dhaka North or Chattogram Metro.", count: stats?.network.zones },
    { icon: Factory, title: "Substations", text: "33/11 kV substations that step voltage down for local distribution.", count: stats?.network.substations },
    { icon: Cable, title: "Feeders", text: "11 kV lines leaving a substation — the unit that is switched during load shedding.", count: stats?.network.feeders },
    { icon: Building2, title: "Areas", text: "Neighbourhoods served by a feeder, each with a priority tier.", count: stats?.network.areas },
    { icon: Home, title: "Connections", text: "Individual customer meters, billed monthly per tariff.", count: stats?.customersServed },
  ];

  return (
    <>
      <PageHero
        eyebrow="About us"
        title="Making load shedding fair, predictable and visible"
        description="PowerGrid BD is an operations platform for an electricity distribution utility. It connects the control room, field technicians and customers around one accurate picture of the grid."
      />

      <Section
        eyebrow="How the network is modelled"
        title="From regional zone to your meter"
        description="Every schedule, outage and bill is anchored to the same hierarchy the utility operates in the field."
      >
        <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {hierarchy.map(({ icon: Icon, title, text, count }, index) => (
            <li key={title} className="relative rounded-xl border bg-card p-5">
              <div className="mb-4 flex items-center justify-between">
                <span className="flex size-10 items-center justify-center rounded-lg bg-primary/15 text-[color-mix(in_oklch,var(--primary),black_40%)] dark:text-primary">
                  <Icon className="size-5" aria-hidden />
                </span>
                <span className="font-mono text-xs text-muted-foreground">L{index + 1}</span>
              </div>
              <h3 className="font-semibold">{title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{text}</p>
              {count !== undefined && (
                <p className="mt-3 text-2xl font-semibold tabular-nums">{formatNumber(count)}</p>
              )}
            </li>
          ))}
        </ol>
      </Section>

      <Section eyebrow="Our principles" title="What the platform guarantees" className="border-t bg-muted/30">
        <div className="grid gap-4 md:grid-cols-2">
          {PRINCIPLES.map(({ icon: Icon, title, text }) => (
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
    </>
  );
}

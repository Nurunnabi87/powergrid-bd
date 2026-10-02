import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BellRing,
  CalendarClock,
  ClipboardCheck,
  Gauge,
  HardHat,
  MapPin,
  Network,
  PlugZap,
  ShieldCheck,
  Timer,
  TriangleAlert,
  UserRound,
  Users,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GridIllustration } from "@/components/marketing/grid-illustration";
import { Section } from "@/components/marketing/section";
import { PublicScheduleList } from "@/components/schedule/public-schedule-list";
import { EmptyState } from "@/components/shared/empty-state";
import { publicGet } from "@/lib/api/server";
import { formatMinutes, formatNumber, todayInDhaka } from "@/lib/format";
import { siteConfig } from "@/lib/site";
import type { PublicSchedule, PublicStats } from "@/types/domain";

export const metadata: Metadata = {
  title: { absolute: `${siteConfig.name} — Know when the power goes. Get it back faster.` },
  description:
    "Check today's load-shedding schedule for your area, report a power outage with a photo, track restoration live and pay your electricity bill online.",
  alternates: { canonical: "/" },
};

// Statically rendered, refreshed every two minutes (ISR).
export const revalidate = 120;

const LIFECYCLE = [
  { icon: TriangleAlert, title: "Reported", text: "A customer reports the fault with a photo and severity." },
  { icon: ClipboardCheck, title: "Acknowledged", text: "The control room verifies the report and its affected area." },
  { icon: HardHat, title: "Dispatched", text: "The nearest available technician in the zone is assigned." },
  { icon: PlugZap, title: "Restored", text: "Power returns; everyone in the area is notified automatically." },
];

const ROLES = [
  {
    icon: UserRound,
    title: "Customers",
    points: ["Your area's shedding slots in advance", "Report outages with photos", "Pay bills by card or bKash"],
  },
  {
    icon: HardHat,
    title: "Technicians",
    points: ["Jobs assigned to you, nearest first", "Start, update and restore in the field", "Track your restoration record"],
  },
  {
    icon: Gauge,
    title: "Grid operators",
    points: ["Priority-based schedule generation", "Race-safe technician dispatch", "Outage and billing analytics"],
  },
];

export default async function HomePage() {
  const today = todayInDhaka();
  const [statsResult, schedulesResult] = await Promise.all([
    publicGet<PublicStats>("/public/stats"),
    publicGet<PublicSchedule[]>("/public/schedules", { date: today, limit: 4 }),
  ]);
  const stats = statsResult?.data ?? null;
  const schedules = schedulesResult?.data ?? [];
  const totalToday = schedulesResult?.meta?.total ?? 0;

  const statItems = stats
    ? [
        { icon: MapPin, label: "Distribution zones", value: formatNumber(stats.network.zones) },
        { icon: Network, label: "Feeders monitored", value: formatNumber(stats.network.feeders) },
        { icon: Users, label: "Customers served", value: formatNumber(stats.customersServed) },
        { icon: Zap, label: "Shedding right now", value: formatNumber(stats.loadShedding.activeNow) },
        { icon: TriangleAlert, label: "Open outages", value: formatNumber(stats.outages.open) },
        { icon: Timer, label: "Avg. restoration", value: formatMinutes(stats.outages.meanTimeToRestoreMinutes) },
      ]
    : [];

  return (
    <>
      {/* Hero */}
      <section className="bg-grid relative overflow-hidden border-b">
        <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/85 to-background" aria-hidden />
        <div className="absolute -top-40 left-1/2 size-[36rem] -translate-x-1/2 rounded-full bg-primary/20 blur-3xl" aria-hidden />
        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-2 lg:px-8">
          <div className="space-y-6">
            <p className="inline-flex items-center gap-2 rounded-full border bg-background/70 px-3 py-1 text-xs font-medium">
              <span className="size-2 animate-pulse rounded-full bg-primary" aria-hidden />
              {stats ? `${stats.loadShedding.schedulesToday} load-shedding slots published for today` : "Live grid status"}
            </p>
            <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl">
              Know when the power goes. <span className="text-[color-mix(in_oklch,var(--primary),black_30%)] dark:text-primary">Get it back faster.</span>
            </h1>
            <p className="max-w-xl text-lg text-muted-foreground">
              {siteConfig.name} publishes your area&apos;s load-shedding schedule, routes outage reports to the nearest
              technician and lets you pay your electricity bill online — all in one place.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button size="lg" className="h-11 px-5" asChild>
                <Link href="/schedule">
                  <CalendarClock /> Check today&apos;s schedule
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="h-11 px-5" asChild>
                <Link href="/login?next=/dashboard/outages/new">
                  <TriangleAlert /> Report an outage
                </Link>
              </Button>
            </div>
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <ShieldCheck className="size-4 text-success" aria-hidden />
              Hospitals and water pumps are never included in load shedding.
            </p>
          </div>
          <GridIllustration className="mx-auto w-full max-w-lg drop-shadow-xl" />
        </div>
      </section>

      {/* Live stats */}
      <section aria-labelledby="stats-heading" className="border-b bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <h2 id="stats-heading" className="sr-only">Live network statistics</h2>
          {stats ? (
            <dl className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-6">
              {statItems.map(({ icon: Icon, label, value }) => (
                <div key={label} className="space-y-1">
                  <dt className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Icon className="size-4" aria-hidden /> {label}
                  </dt>
                  <dd className="text-2xl font-semibold tabular-nums sm:text-3xl">{value}</dd>
                </div>
              ))}
            </dl>
          ) : (
            <p className="text-center text-sm text-muted-foreground">
              Live network statistics are temporarily unavailable. Please check back shortly.
            </p>
          )}
        </div>
      </section>

      {/* Today's schedule */}
      <Section
        eyebrow="Today"
        title="Load-shedding across the network"
        description="Published slots for today. Search for your area on the full schedule to see exactly when your feeder is affected."
      >
        {schedules.length > 0 ? (
          <div className="space-y-6">
            <PublicScheduleList schedules={schedules} />
            <Button variant="outline" asChild>
              <Link href="/schedule">
                View all {totalToday} slots for today <ArrowRight />
              </Link>
            </Button>
          </div>
        ) : (
          <EmptyState
            icon={Zap}
            title="No load shedding scheduled today"
            description="Supply is meeting demand across the network. Future slots will appear here as soon as they are published."
            action={
              <Button variant="outline" asChild>
                <Link href="/schedule">Browse other dates</Link>
              </Button>
            }
          />
        )}
      </Section>

      {/* Outage lifecycle */}
      <Section
        eyebrow="Unexpected outages"
        title="From your report to the lights coming back"
        description="Every outage follows the same audited lifecycle, so you always know what is happening and who is on it."
        className="border-y bg-muted/30"
      >
        <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {LIFECYCLE.map(({ icon: Icon, title, text }, index) => (
            <li key={title} className="relative rounded-xl border bg-card p-5">
              <span className="absolute top-5 right-5 font-mono text-xs text-muted-foreground">0{index + 1}</span>
              <span className="mb-4 flex size-10 items-center justify-center rounded-lg bg-primary/15 text-[color-mix(in_oklch,var(--primary),black_40%)] dark:text-primary">
                <Icon className="size-5" aria-hidden />
              </span>
              <h3 className="font-semibold">{title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{text}</p>
            </li>
          ))}
        </ol>
      </Section>

      {/* Roles */}
      <Section eyebrow="One platform" title="Built for everyone who keeps the grid running">
        <div className="grid gap-4 md:grid-cols-3">
          {ROLES.map(({ icon: Icon, title, points }) => (
            <Card key={title}>
              <CardHeader>
                <span className="mb-2 flex size-10 items-center justify-center rounded-lg bg-secondary">
                  <Icon className="size-5" aria-hidden />
                </span>
                <CardTitle>{title}</CardTitle>
                <CardDescription>What you can do</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  {points.map((point) => (
                    <li key={point} className="flex gap-2">
                      <Zap className="mt-0.5 size-3.5 shrink-0 text-[color-mix(in_oklch,var(--primary),black_25%)] dark:text-primary" aria-hidden />
                      {point}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </Section>

      {/* CTA */}
      <section className="px-4 pb-20 sm:px-6 lg:px-8">
        <div className="relative mx-auto max-w-7xl overflow-hidden rounded-2xl bg-[oklch(0.22_0.045_264)] px-6 py-12 text-white sm:px-12">
          <div className="absolute -right-16 -bottom-24 size-72 rounded-full bg-primary/30 blur-3xl" aria-hidden />
          <div className="relative flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Get outage alerts for your meter</h2>
              <p className="max-w-xl text-white/75">
                Create a free customer account to see your personal schedule, receive restoration notifications and pay bills online.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button size="lg" className="h-11 px-5" asChild>
                <Link href="/register">
                  <BellRing /> Create account
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="h-11 border-white/30 bg-transparent px-5 text-white hover:bg-white/10 hover:text-white" asChild>
                <Link href="/login">Try a demo account</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

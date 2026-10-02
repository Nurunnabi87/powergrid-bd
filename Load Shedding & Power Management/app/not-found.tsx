import type { Metadata } from "next";
import Link from "next/link";
import { CalendarClock, Home, ZapOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/shared/logo";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false },
};

export default function NotFound() {
  return (
    <main className="bg-grid relative flex flex-1 flex-col items-center justify-center px-4 py-16">
      <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/90 to-background" aria-hidden />
      <div className="relative flex max-w-md flex-col items-center gap-6 text-center">
        <Logo />
        <span className="flex size-16 items-center justify-center rounded-2xl bg-primary/15 text-[color-mix(in_oklch,var(--primary),black_40%)] dark:text-primary">
          <ZapOff className="size-8" aria-hidden />
        </span>
        <div className="space-y-2">
          <p className="font-mono text-sm font-medium text-muted-foreground">Error 404</p>
          <h1 className="text-3xl font-semibold tracking-tight">This line is dead</h1>
          <p className="text-muted-foreground">
            The page you were looking for doesn&apos;t exist or has been moved. Check the address,
            or head back to somewhere with power.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button asChild size="lg">
            <Link href="/">
              <Home /> Back to home
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/schedule">
              <CalendarClock /> Today&apos;s schedule
            </Link>
          </Button>
        </div>
      </div>
    </main>
  );
}

import Link from "next/link";
import { CalendarClock, ShieldCheck, Wrench, Zap } from "lucide-react";
import { Logo } from "@/components/shared/logo";
import { ThemeToggle } from "@/components/shared/theme-toggle";

const HIGHLIGHTS = [
  {
    icon: CalendarClock,
    title: "Know before the lights go out",
    text: "Your area's load-shedding slots, published ahead of time.",
  },
  {
    icon: Wrench,
    title: "Report a fault in seconds",
    text: "Photo reports go straight to dispatch and a field technician.",
  },
  {
    icon: ShieldCheck,
    title: "Pay bills securely",
    text: "Card payments via Stripe or bKash, verified server-side.",
  },
];

/** Split layout: brand panel (desktop) beside the auth form. */
export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
      <aside className="relative hidden overflow-hidden bg-[oklch(0.2_0.04_264)] p-10 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="bg-grid absolute inset-0 opacity-[0.07]" aria-hidden />
        <div
          className="absolute -top-32 -right-24 size-96 rounded-full bg-primary/30 blur-3xl"
          aria-hidden
        />
        <div className="relative [&_span]:text-white">
          <Logo />
        </div>
        <div className="relative space-y-8">
          <div className="space-y-3">
            <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-primary">
              <Zap className="size-3.5 fill-current" /> National distribution network
            </p>
            <h2 className="max-w-md text-3xl font-semibold tracking-tight text-balance">
              Keeping Bangladesh informed through every outage.
            </h2>
          </div>
          <ul className="space-y-5">
            {HIGHLIGHTS.map(({ icon: Icon, title, text }) => (
              <li key={title} className="flex gap-3">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-white/10 text-primary">
                  <Icon className="size-4.5" aria-hidden />
                </span>
                <div>
                  <p className="font-medium">{title}</p>
                  <p className="text-sm text-white/70">{text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <p className="relative text-xs text-white/50">
          © {new Date().getFullYear()} PowerGrid BD. Demo system for evaluation.
        </p>
      </aside>

      <main className="flex flex-col">
        <header className="flex items-center justify-between px-4 py-4 sm:px-8">
          <div className="lg:hidden">
            <Logo />
          </div>
          <Link href="/" className="hidden text-sm text-muted-foreground hover:text-foreground lg:inline">
            ← Back to website
          </Link>
          <ThemeToggle />
        </header>
        <div className="flex flex-1 items-start justify-center px-4 pb-12 sm:px-8 lg:items-center">
          <div className="w-full max-w-lg">{children}</div>
        </div>
      </main>
    </div>
  );
}

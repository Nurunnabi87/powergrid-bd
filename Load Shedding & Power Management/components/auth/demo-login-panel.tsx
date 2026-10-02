"use client";

import { useState, useTransition } from "react";
import { HardHat, Rocket, ShieldUser, UserRound, type LucideIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { demoLoginAction } from "@/lib/auth/actions";
import { cn } from "@/lib/utils";
import type { UserRole } from "@/types/domain";

interface DemoRole {
  role: UserRole;
  title: string;
  description: string;
  icon: LucideIcon;
  accent: string;
}

const DEMO_ROLES: DemoRole[] = [
  {
    role: "ADMIN",
    title: "Admin",
    description: "Grid operations, dispatch, schedules & analytics",
    icon: ShieldUser,
    accent: "bg-destructive/10 text-destructive",
  },
  {
    role: "CUSTOMER",
    title: "Customer",
    description: "Schedules, outage reports, bills & payments",
    icon: UserRound,
    accent: "bg-info/12 text-info",
  },
  {
    role: "TECHNICIAN",
    title: "Technician",
    description: "Assigned jobs, restoration & availability",
    icon: HardHat,
    accent: "bg-warning/15 text-[color-mix(in_oklch,var(--warning),black_35%)] dark:text-warning",
  },
];

/** One-click demo accounts for evaluators; credentials stay on the server. */
export function DemoLoginPanel() {
  const [isPending, startTransition] = useTransition();
  const [activeRole, setActiveRole] = useState<UserRole | null>(null);

  const login = (role: UserRole) => {
    setActiveRole(role);
    startTransition(async () => {
      const error = await demoLoginAction(role);
      // Only reached on failure: success redirects to the role dashboard.
      toast.error(error.message);
      setActiveRole(null);
    });
  };

  return (
    <section aria-labelledby="demo-login-heading" className="space-y-3">
      <h2 id="demo-login-heading" className="flex items-center justify-center gap-2 text-sm font-semibold">
        <Rocket className="size-4 text-[color-mix(in_oklch,var(--primary),black_30%)] dark:text-primary" aria-hidden />
        Quick Demo Login
      </h2>
      <div className="grid gap-3 sm:grid-cols-2">
        {DEMO_ROLES.map(({ role, title, description, icon: Icon, accent }, index) => (
          <Card
            key={role}
            className={cn(
              "gap-0 py-0 transition-shadow hover:shadow-md",
              // Third card centred beneath the first two, as in the layout spec.
              index === 2 && "sm:col-span-2 sm:mx-auto sm:w-[calc(50%-0.375rem)]"
            )}
          >
            <CardContent className="flex h-full flex-col gap-3 p-4">
              <div className="flex items-start gap-3">
                <span className={cn("flex size-10 shrink-0 items-center justify-center rounded-lg", accent)}>
                  <Icon className="size-5" aria-hidden />
                </span>
                <div className="min-w-0">
                  <p className="font-medium">{title}</p>
                  <p className="text-xs text-muted-foreground">{description}</p>
                </div>
              </div>
              <Button
                variant="outline"
                className="mt-auto w-full"
                disabled={isPending}
                onClick={() => login(role)}
                aria-label={`Demo login as ${title}`}
              >
                {activeRole === role ? <Spinner /> : null}
                {activeRole === role ? "Signing in…" : "Demo Login"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}

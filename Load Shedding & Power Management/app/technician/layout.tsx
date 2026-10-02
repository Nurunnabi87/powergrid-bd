import type { Metadata } from "next";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { SessionHydrator } from "@/components/providers/session-hydrator";
import { requireRole } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: { default: "Technician", template: "%s · Technician | PowerGrid BD" },
  robots: { index: false },
};

/** Technician area. proxy.ts guards the route; requireRole re-checks on the server. */
export default async function TechnicianLayout({ children }: LayoutProps<"/technician">) {
  const user = await requireRole("TECHNICIAN");

  return (
    <SessionHydrator user={user}>
      <DashboardShell role="TECHNICIAN">{children}</DashboardShell>
    </SessionHydrator>
  );
}

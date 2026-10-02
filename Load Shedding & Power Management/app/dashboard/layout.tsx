import type { Metadata } from "next";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { SessionHydrator } from "@/components/providers/session-hydrator";
import { requireRole } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: { default: "Dashboard", template: "%s · Dashboard | PowerGrid BD" },
  robots: { index: false },
};

/** Customer area. proxy.ts guards the route; requireRole re-checks on the server. */
export default async function CustomerLayout({ children }: LayoutProps<"/dashboard">) {
  const user = await requireRole("CUSTOMER");

  return (
    <SessionHydrator user={user}>
      <DashboardShell role="CUSTOMER">{children}</DashboardShell>
    </SessionHydrator>
  );
}

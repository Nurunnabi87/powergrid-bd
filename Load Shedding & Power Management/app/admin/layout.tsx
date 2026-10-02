import type { Metadata } from "next";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { SessionHydrator } from "@/components/providers/session-hydrator";
import { requireRole } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s · Admin | PowerGrid BD" },
  robots: { index: false },
};

/** Admin area. proxy.ts guards the route; requireRole re-checks on the server. */
export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  const user = await requireRole("ADMIN");

  return (
    <SessionHydrator user={user}>
      <DashboardShell role="ADMIN">{children}</DashboardShell>
    </SessionHydrator>
  );
}

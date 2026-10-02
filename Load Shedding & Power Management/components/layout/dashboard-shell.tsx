"use client";

import type { ReactNode } from "react";
import { PanelLeftClose, PanelLeftOpen, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { NotificationBell } from "@/components/notifications/notification-bell";
import { SidebarNav } from "@/components/layout/sidebar-nav";
import { UserMenu } from "@/components/layout/user-menu";
import { Logo } from "@/components/shared/logo";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { ROLE_BADGE_ICON } from "@/config/navigation";
import { ROLE_HOME, ROLE_LABEL } from "@/lib/auth/roles";
import { cn } from "@/lib/utils";
import { useUiStore } from "@/stores/ui-store";
import type { UserRole } from "@/types/domain";

const NOTIFICATIONS_HREF: Record<UserRole, string> = {
  ADMIN: "/admin/notifications",
  CUSTOMER: "/dashboard/notifications",
  TECHNICIAN: "/technician/notifications",
};

function RoleBadge({ role, compact = false }: { role: UserRole; compact?: boolean }) {
  const Icon = ROLE_BADGE_ICON[role];
  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-lg border bg-background/60 px-3 py-2 text-xs font-medium text-muted-foreground",
        compact && "justify-center px-0"
      )}
    >
      <Icon className="size-4 text-[color-mix(in_oklch,var(--primary),black_30%)] dark:text-primary" aria-hidden />
      {!compact && <span>{ROLE_LABEL[role]} workspace</span>}
    </div>
  );
}

/**
 * Shared chrome for all three role dashboards: a collapsible sidebar on
 * desktop, a slide-over drawer on phones, and a header with notifications,
 * theme and account menus. Only the nav items differ per role.
 */
export function DashboardShell({ role, children }: { role: UserRole; children: ReactNode }) {
  const collapsed = useUiStore((state) => state.sidebarCollapsed);
  const toggleSidebar = useUiStore((state) => state.toggleSidebar);
  const mobileNavOpen = useUiStore((state) => state.mobileNavOpen);
  const setMobileNavOpen = useUiStore((state) => state.setMobileNavOpen);

  return (
    <div className="flex min-h-dvh">
      {/* Desktop sidebar */}
      <aside
        className={cn(
          "sticky top-0 hidden h-dvh shrink-0 flex-col border-r bg-sidebar transition-[width] duration-200 lg:flex",
          collapsed ? "w-[4.5rem]" : "w-64"
        )}
      >
        <div className={cn("flex h-16 items-center border-b px-4", collapsed && "justify-center px-0")}>
          <Logo href={ROLE_HOME[role]} compact={collapsed} />
        </div>
        <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-3">
          <RoleBadge role={role} compact={collapsed} />
          <SidebarNav role={role} collapsed={collapsed} />
        </div>
        <div className="border-t p-3">
          <Button
            variant="ghost"
            className={cn("w-full justify-start", collapsed && "justify-center")}
            onClick={toggleSidebar}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <PanelLeftOpen /> : <PanelLeftClose />}
            {!collapsed && "Collapse"}
          </Button>
        </div>
      </aside>

      {/* Mobile drawer */}
      <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
        <SheetContent side="left" className="w-72 bg-sidebar p-0">
          <SheetHeader className="border-b p-4">
            <SheetTitle asChild>
              <div>
                <Logo href={ROLE_HOME[role]} />
              </div>
            </SheetTitle>
            <SheetDescription className="sr-only">Dashboard navigation</SheetDescription>
          </SheetHeader>
          <div className="flex flex-col gap-4 p-3">
            <RoleBadge role={role} />
            <SidebarNav role={role} onNavigate={() => setMobileNavOpen(false)} />
          </div>
        </SheetContent>
      </Sheet>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-2 border-b bg-background/85 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/70 sm:px-6">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setMobileNavOpen(true)}
            aria-label="Open navigation"
          >
            <Menu />
          </Button>
          <div className="lg:hidden">
            <Logo href={ROLE_HOME[role]} compact />
          </div>
          <div className="ml-auto flex items-center gap-1">
            <NotificationBell viewAllHref={NOTIFICATIONS_HREF[role]} />
            <ThemeToggle />
            <UserMenu />
          </div>
        </header>
        <main id="main" className="flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <div className="mx-auto w-full max-w-7xl space-y-6">{children}</div>
        </main>
      </div>
    </div>
  );
}

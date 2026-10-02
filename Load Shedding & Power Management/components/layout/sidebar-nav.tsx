"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { NAVIGATION, isNavActive } from "@/config/navigation";
import { cn } from "@/lib/utils";
import type { UserRole } from "@/types/domain";

interface SidebarNavProps {
  role: UserRole;
  collapsed?: boolean;
  onNavigate?: () => void;
}

/** The role's navigation links; icons only (with tooltips) when collapsed. */
export function SidebarNav({ role, collapsed = false, onNavigate }: SidebarNavProps) {
  const pathname = usePathname();

  return (
    <nav aria-label="Dashboard" className="flex flex-col gap-1">
      {NAVIGATION[role].map((item) => {
        const active = isNavActive(item, pathname);
        const link = (
          <Link
            href={item.href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "group flex h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium text-sidebar-foreground/75 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground",
              active && "bg-sidebar-accent text-sidebar-foreground",
              collapsed && "justify-center px-0"
            )}
          >
            <item.icon
              className={cn(
                "size-4.5 shrink-0",
                active && "text-[color-mix(in_oklch,var(--primary),black_30%)] dark:text-primary"
              )}
              aria-hidden
            />
            {collapsed ? <span className="sr-only">{item.title}</span> : <span className="truncate">{item.title}</span>}
            {active && !collapsed && <span className="ml-auto size-1.5 rounded-full bg-primary" aria-hidden />}
          </Link>
        );

        return collapsed ? (
          <Tooltip key={item.href}>
            <TooltipTrigger asChild>{link}</TooltipTrigger>
            <TooltipContent side="right">{item.title}</TooltipContent>
          </Tooltip>
        ) : (
          <div key={item.href}>{link}</div>
        );
      })}
    </nav>
  );
}

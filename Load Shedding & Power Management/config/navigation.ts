import {
  Bell,
  CalendarClock,
  ChartColumn,
  ClipboardList,
  CreditCard,
  FileChartColumn,
  Gauge,
  LayoutDashboard,
  Network,
  Receipt,
  TriangleAlert,
  UserRound,
  Users,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import type { UserRole } from "@/types/domain";

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  /** Match only the exact path (for section roots like /admin). */
  exact?: boolean;
}

/**
 * Role-specific navigation. Each role only ever sees links to its own area;
 * proxy.ts enforces the same boundaries at the route level.
 */
export const NAVIGATION: Record<UserRole, NavItem[]> = {
  ADMIN: [
    { title: "Overview", href: "/admin", icon: LayoutDashboard, exact: true },
    { title: "Outages", href: "/admin/outages", icon: TriangleAlert },
    { title: "Load shedding", href: "/admin/schedules", icon: CalendarClock },
    { title: "Network", href: "/admin/network", icon: Network },
    { title: "Users", href: "/admin/users", icon: Users },
    { title: "Billing", href: "/admin/billing", icon: Receipt },
    { title: "Reports", href: "/admin/reports", icon: FileChartColumn },
    { title: "Notifications", href: "/admin/notifications", icon: Bell },
  ],
  CUSTOMER: [
    { title: "Overview", href: "/dashboard", icon: LayoutDashboard, exact: true },
    { title: "My schedule", href: "/dashboard/schedule", icon: CalendarClock },
    { title: "Outage reports", href: "/dashboard/outages", icon: TriangleAlert },
    { title: "Bills", href: "/dashboard/bills", icon: Receipt },
    { title: "Payments", href: "/dashboard/payments", icon: CreditCard },
    { title: "Notifications", href: "/dashboard/notifications", icon: Bell },
    { title: "Profile", href: "/dashboard/profile", icon: UserRound },
  ],
  TECHNICIAN: [
    { title: "My jobs", href: "/technician", icon: ClipboardList, exact: true },
    { title: "Performance", href: "/technician/performance", icon: ChartColumn },
    { title: "Notifications", href: "/technician/notifications", icon: Bell },
    { title: "Profile & availability", href: "/technician/profile", icon: Wrench },
  ],
};

export const ROLE_BADGE_ICON: Record<UserRole, LucideIcon> = {
  ADMIN: Gauge,
  CUSTOMER: UserRound,
  TECHNICIAN: Wrench,
};

export const isNavActive = (item: NavItem, pathname: string): boolean =>
  item.exact ? pathname === item.href : pathname === item.href || pathname.startsWith(`${item.href}/`);

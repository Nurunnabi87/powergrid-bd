import {
  BadgeCheck,
  CalendarClock,
  CircleX,
  PlugZap,
  Receipt,
  TriangleAlert,
  UserCheck,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import type { NotificationType } from "@/types/domain";

/** Icon and accent per notification type. */
export const NOTIFICATION_META: Record<NotificationType, { icon: LucideIcon; className: string }> = {
  SCHEDULE_PUBLISHED: { icon: CalendarClock, className: "bg-info/12 text-info" },
  OUTAGE_REPORTED: { icon: TriangleAlert, className: "bg-warning/15 text-[color-mix(in_oklch,var(--warning),black_35%)] dark:text-warning" },
  OUTAGE_ASSIGNED: { icon: UserCheck, className: "bg-primary/15 text-[color-mix(in_oklch,var(--primary),black_40%)] dark:text-primary" },
  OUTAGE_RESOLVED: { icon: Wrench, className: "bg-success/12 text-success" },
  POWER_RESTORED: { icon: PlugZap, className: "bg-success/12 text-success" },
  BILL_GENERATED: { icon: Receipt, className: "bg-info/12 text-info" },
  PAYMENT_SUCCESS: { icon: BadgeCheck, className: "bg-success/12 text-success" },
  PAYMENT_FAILED: { icon: CircleX, className: "bg-destructive/10 text-destructive" },
};

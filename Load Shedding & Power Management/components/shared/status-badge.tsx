import { cn } from "@/lib/utils";
import { humanize } from "@/lib/format";

/**
 * One badge for every status-like enum in the system. Tones are semantic,
 * so "RESOLVED", "PAID" and "COMPLETED" all read as success everywhere.
 */

type Tone = "success" | "warning" | "danger" | "info" | "primary" | "neutral";

const TONE_CLASSES: Record<Tone, string> = {
  success: "bg-success/12 text-success ring-success/25 dark:bg-success/15",
  warning: "bg-warning/15 text-[color-mix(in_oklch,var(--warning),black_35%)] ring-warning/30 dark:text-warning",
  danger: "bg-destructive/10 text-destructive ring-destructive/25 dark:bg-destructive/15",
  info: "bg-info/12 text-info ring-info/25 dark:bg-info/15",
  primary: "bg-primary/15 text-[color-mix(in_oklch,var(--primary),black_45%)] ring-primary/30 dark:text-primary",
  neutral: "bg-muted text-muted-foreground ring-border",
};

const DOT_CLASSES: Record<Tone, string> = {
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-destructive",
  info: "bg-info",
  primary: "bg-primary",
  neutral: "bg-muted-foreground/60",
};

const STATUS_TONES: Record<string, Tone> = {
  // Outage lifecycle
  REPORTED: "warning",
  ACKNOWLEDGED: "info",
  ASSIGNED: "primary",
  IN_PROGRESS: "info",
  RESOLVED: "success",
  CLOSED: "neutral",
  // Schedules
  PLANNED: "info",
  ACTIVE: "warning",
  COMPLETED: "success",
  CANCELLED: "neutral",
  // Bills & payments
  UNPAID: "warning",
  PENDING: "info",
  PAID: "success",
  OVERDUE: "danger",
  INITIATED: "info",
  FAILED: "danger",
  // Assignments
  ACCEPTED: "info",
  REASSIGNED: "neutral",
  // Users & connections
  BANNED: "danger",
  SUSPENDED: "warning",
  DISCONNECTED: "neutral",
  // Substations
  OPERATIONAL: "success",
  MAINTENANCE: "warning",
  OFFLINE: "danger",
};

/** Severity and priority read hotter as they rise. */
const SCALE_TONES: Record<string, Tone> = {
  LOW: "neutral",
  NORMAL: "info",
  MEDIUM: "info",
  HIGH: "warning",
  CRITICAL: "danger",
};

interface StatusBadgeProps {
  status: string;
  /** "scale" is for severity / priority tiers. */
  kind?: "status" | "scale";
  label?: string;
  className?: string;
  dot?: boolean;
}

export function StatusBadge({ status, kind = "status", label, className, dot = true }: StatusBadgeProps) {
  // "ACTIVE" is a warning for a shedding slot but healthy for a user or
  // connection; callers pass kind="scale" or a label to disambiguate where
  // needed, and account statuses use the "account" helper below.
  const tone = (kind === "scale" ? SCALE_TONES[status] : STATUS_TONES[status]) ?? "neutral";

  return (
    <span
      className={cn(
        "inline-flex h-6 w-fit items-center gap-1.5 rounded-full px-2.5 text-xs font-medium whitespace-nowrap ring-1 ring-inset",
        TONE_CLASSES[tone],
        className
      )}
    >
      {dot && <span aria-hidden className={cn("size-1.5 rounded-full", DOT_CLASSES[tone])} />}
      {label ?? humanize(status)}
    </span>
  );
}

/** Account/connection status, where ACTIVE is the healthy state. */
export function AccountStatusBadge({ status }: { status: string }) {
  if (status === "ACTIVE") {
    return (
      <span className="inline-flex h-6 w-fit items-center gap-1.5 rounded-full bg-success/12 px-2.5 text-xs font-medium text-success ring-1 ring-success/25 ring-inset">
        <span aria-hidden className="size-1.5 rounded-full bg-success" />
        Active
      </span>
    );
  }
  return <StatusBadge status={status} />;
}

import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type Tone = "success" | "warning" | "danger";

const TONES: Record<Tone, string> = {
  success: "bg-success/12 text-success",
  warning: "bg-warning/15 text-[color-mix(in_oklch,var(--warning),black_35%)] dark:text-warning",
  danger: "bg-destructive/10 text-destructive",
};

/** Card used by the success / cancel / failed payment return pages. */
export function PaymentResult({
  icon: Icon,
  tone,
  title,
  description,
  children,
  actions,
}: {
  icon: LucideIcon;
  tone: Tone;
  title: string;
  description: ReactNode;
  children?: ReactNode;
  actions: ReactNode;
}) {
  return (
    <Card role="status" aria-live="polite">
      <CardHeader className="items-center text-center">
        <span className={cn("mx-auto mb-2 flex size-16 items-center justify-center rounded-full", TONES[tone])}>
          <Icon className="size-8" aria-hidden />
        </span>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        <p className="text-muted-foreground">{description}</p>
      </CardHeader>
      {children && <CardContent>{children}</CardContent>}
      <CardFooter className="flex flex-col gap-2 border-t sm:flex-row sm:justify-center">{actions}</CardFooter>
    </Card>
  );
}

export function ReceiptRows({ rows }: { rows: { label: string; value: ReactNode; mono?: boolean }[] }) {
  return (
    <dl className="divide-y rounded-lg border">
      {rows.map(({ label, value, mono }) => (
        <div key={label} className="flex items-center justify-between gap-4 px-4 py-2.5 text-sm">
          <dt className="text-muted-foreground">{label}</dt>
          <dd className={cn("text-right font-medium break-all", mono && "font-mono text-xs")}>{value}</dd>
        </div>
      ))}
    </dl>
  );
}

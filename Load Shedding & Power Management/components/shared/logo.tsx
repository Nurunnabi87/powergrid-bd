import Link from "next/link";
import { Zap } from "lucide-react";
import { cn } from "@/lib/utils";

export function Logo({ href = "/", className, compact = false }: { href?: string; className?: string; compact?: boolean }) {
  return (
    <Link href={href} className={cn("group flex items-center gap-2 font-semibold tracking-tight", className)} aria-label="PowerGrid BD home">
      <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm transition-transform group-hover:scale-105">
        <Zap className="size-4.5 fill-current" aria-hidden />
      </span>
      {!compact && (
        <span className="text-base">
          PowerGrid<span className="text-[color-mix(in_oklch,var(--primary),black_35%)] dark:text-primary"> BD</span>
        </span>
      )}
    </Link>
  );
}

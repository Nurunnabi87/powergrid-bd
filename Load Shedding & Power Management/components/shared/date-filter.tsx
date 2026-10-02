"use client";

import { CalendarDays } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useUrlState } from "@/hooks/use-url-state";
import { cn } from "@/lib/utils";

interface DateFilterProps {
  param: string;
  label: string;
  /** Shown when the URL has no value (e.g. today). */
  fallback?: string;
  className?: string;
}

/** Native date picker bound to a URL parameter (mobile-friendly keyboards). */
export function DateFilter({ param, label, fallback = "", className }: DateFilterProps) {
  const { get, set } = useUrlState();

  return (
    <div className={cn("relative w-full sm:w-44", className)}>
      <CalendarDays className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
      <Input
        type="date"
        aria-label={label}
        value={get(param) || fallback}
        onChange={(event) => set({ [param]: event.target.value || null })}
        className="h-9 pl-8"
      />
    </div>
  );
}

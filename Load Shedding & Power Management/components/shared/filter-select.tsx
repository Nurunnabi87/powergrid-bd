"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUrlState } from "@/hooks/use-url-state";
import { humanize } from "@/lib/format";
import { cn } from "@/lib/utils";

export interface FilterOption {
  value: string;
  label: string;
}

interface FilterSelectProps {
  /** URL parameter this select controls. */
  param: string;
  label: string;
  options: readonly string[] | FilterOption[];
  /** Label for the "no filter" option. */
  allLabel?: string;
  className?: string;
}

const normalise = (options: FilterSelectProps["options"]): FilterOption[] =>
  options.map((option) =>
    typeof option === "string" ? { value: option, label: humanize(option) } : option
  );

/** A select bound to one URL query parameter ("all" removes it). */
export function FilterSelect({ param, label, options, allLabel = "All", className }: FilterSelectProps) {
  const { get, set } = useUrlState();
  const value = get(param) || "all";

  return (
    <Select value={value} onValueChange={(next) => set({ [param]: next })}>
      <SelectTrigger className={cn("h-9 w-full sm:w-44", className)} aria-label={label}>
        <SelectValue placeholder={label} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">
          {allLabel} {label.toLowerCase()}
        </SelectItem>
        {normalise(options).map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

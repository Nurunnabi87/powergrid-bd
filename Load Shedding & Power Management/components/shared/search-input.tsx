"use client";

import { useEffect, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/use-debounce";
import { useUrlState } from "@/hooks/use-url-state";
import { cn } from "@/lib/utils";

interface SearchInputProps {
  placeholder?: string;
  /** URL parameter to write to (default "search"). */
  param?: string;
  className?: string;
}

/** Debounced search box bound to a URL query parameter. */
export function SearchInput({ placeholder = "Search…", param = "search", className }: SearchInputProps) {
  const { get, set } = useUrlState();
  const urlValue = get(param);
  const [value, setValue] = useState(urlValue);
  const debounced = useDebounce(value, 400);
  const lastPushed = useRef(urlValue);

  // Push the debounced text to the URL.
  useEffect(() => {
    const trimmed = debounced.trim();
    if (trimmed === lastPushed.current) return;
    lastPushed.current = trimmed;
    set({ [param]: trimmed });
  }, [debounced, param, set]);

  // Follow external URL changes (back button, "clear filters").
  useEffect(() => {
    if (urlValue !== lastPushed.current) {
      lastPushed.current = urlValue;
      setValue(urlValue);
    }
  }, [urlValue]);

  return (
    <div className={cn("relative w-full sm:max-w-xs", className)}>
      <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
      <Input
        type="search"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="h-9 pr-8 pl-8"
      />
      {value && (
        <button
          type="button"
          onClick={() => setValue("")}
          className="absolute top-1/2 right-2 -translate-y-1/2 rounded p-0.5 text-muted-foreground hover:text-foreground"
          aria-label="Clear search"
        >
          <X className="size-4" />
        </button>
      )}
    </div>
  );
}

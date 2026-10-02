"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUrlState } from "@/hooks/use-url-state";
import type { Meta } from "@/types/api";

/** Builds a compact page list: 1 … 4 5 6 … 12 */
const pageWindow = (current: number, total: number): (number | "gap")[] => {
  if (total <= 7) return Array.from({ length: total }, (_, index) => index + 1);
  const pages = new Set([1, total, current - 1, current, current + 1]);
  const sorted = [...pages].filter((page) => page >= 1 && page <= total).sort((a, b) => a - b);
  const result: (number | "gap")[] = [];
  sorted.forEach((page, index) => {
    if (index > 0 && page - sorted[index - 1] > 1) result.push("gap");
    result.push(page);
  });
  return result;
};

/** URL-synced pagination with a "showing x–y of z" summary. */
export function PaginationBar({ meta, noun = "results" }: { meta: Meta; noun?: string }) {
  const { set, isPending } = useUrlState();
  const { page, limit, total, totalPages } = meta;

  if (total === 0) return null;

  const from = (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);
  const go = (next: number) => set({ page: next === 1 ? null : next }, { scroll: true });

  return (
    <nav
      aria-label="Pagination"
      className="flex flex-col items-center justify-between gap-3 border-t pt-4 sm:flex-row"
      data-pending={isPending || undefined}
    >
      <p className="text-sm text-muted-foreground">
        Showing <span className="font-medium text-foreground tabular-nums">{from}–{to}</span> of{" "}
        <span className="font-medium text-foreground tabular-nums">{total}</span> {noun}
      </p>

      {totalPages > 1 && (
        <div className="flex items-center gap-1">
          <Button variant="outline" size="icon" onClick={() => go(page - 1)} disabled={page <= 1 || isPending} aria-label="Previous page">
            <ChevronLeft />
          </Button>
          <div className="hidden items-center gap-1 sm:flex">
            {pageWindow(page, totalPages).map((item, index) =>
              item === "gap" ? (
                <span key={`gap-${index}`} className="px-1 text-muted-foreground">…</span>
              ) : (
                <Button
                  key={item}
                  variant={item === page ? "default" : "ghost"}
                  size="icon"
                  onClick={() => go(item)}
                  disabled={isPending}
                  aria-current={item === page ? "page" : undefined}
                  aria-label={`Page ${item}`}
                >
                  {item}
                </Button>
              )
            )}
          </div>
          <span className="px-2 text-sm text-muted-foreground sm:hidden">
            {page} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="icon"
            onClick={() => go(page + 1)}
            disabled={page >= totalPages || isPending}
            aria-label="Next page"
          >
            <ChevronRight />
          </Button>
        </div>
      )}
    </nav>
  );
}

"use client";

import { useCallback, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type Updates = Record<string, string | number | null | undefined>;

/**
 * Filters, search, sort and pagination live in the URL so a view can be
 * bookmarked, shared and restored with the back button.
 *
 * Any change other than `page` resets to page 1, because a new filter makes
 * the old page number meaningless.
 */
export function useUrlState() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const get = useCallback((key: string) => searchParams.get(key) ?? "", [searchParams]);

  const set = useCallback(
    (updates: Updates, { scroll = false }: { scroll?: boolean } = {}) => {
      const params = new URLSearchParams(searchParams.toString());

      for (const [key, value] of Object.entries(updates)) {
        if (value === null || value === undefined || value === "" || value === "all") {
          params.delete(key);
        } else {
          params.set(key, String(value));
        }
      }

      if (!("page" in updates)) params.delete("page");

      const query = params.toString();
      startTransition(() => {
        router.replace(query ? `${pathname}?${query}` : pathname, { scroll });
      });
    },
    [pathname, router, searchParams]
  );

  const reset = useCallback(
    (keep: string[] = []) => {
      const params = new URLSearchParams();
      for (const key of keep) {
        const value = searchParams.get(key);
        if (value) params.set(key, value);
      }
      const query = params.toString();
      startTransition(() => router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false }));
    },
    [pathname, router, searchParams]
  );

  return { get, set, reset, searchParams, isPending };
}

/** Current page from the URL, clamped to >= 1. */
export function usePage(): number {
  const searchParams = useSearchParams();
  const page = Number(searchParams.get("page"));
  return Number.isInteger(page) && page > 0 ? page : 1;
}

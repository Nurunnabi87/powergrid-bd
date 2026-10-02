import type { QueryParams } from "@/types/api";

/** Builds `?a=1&b=2`, skipping empty values. Returns "" when nothing is set. */
export const toQueryString = (params?: QueryParams): string => {
  if (!params) return "";
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") continue;
    search.set(key, String(value));
  }
  const query = search.toString();
  return query ? `?${query}` : "";
};

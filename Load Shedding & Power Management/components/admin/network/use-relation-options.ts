"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { queryKeys } from "@/lib/query/keys";
import type { FilterOption } from "@/components/shared/filter-select";

export type RelationKey = "zones" | "substations" | "feeders" | "areas" | "customers";

interface RelationRow {
  id: string;
  name: string;
  code?: string;
  email?: string;
}

const RELATIONS: Record<RelationKey, { endpoint: string; query: Record<string, string | number>; label: (row: RelationRow) => string }> = {
  zones: { endpoint: "/zones", query: { limit: 100, sortBy: "name", sortOrder: "asc" }, label: (r) => `${r.name} (${r.code})` },
  substations: { endpoint: "/substations", query: { limit: 100, sortBy: "name", sortOrder: "asc" }, label: (r) => `${r.name} (${r.code})` },
  feeders: { endpoint: "/feeders", query: { limit: 100, sortBy: "name", sortOrder: "asc" }, label: (r) => `${r.name} (${r.code})` },
  areas: { endpoint: "/areas", query: { limit: 100, sortBy: "name", sortOrder: "asc" }, label: (r) => `${r.name} (${r.code})` },
  customers: {
    endpoint: "/admin/users",
    query: { role: "CUSTOMER", status: "ACTIVE", limit: 100, sortBy: "name", sortOrder: "asc" },
    label: (r) => `${r.name} · ${r.email}`,
  },
};

/** Options for a parent-record select (e.g. the zone a substation belongs to). */
export function useRelationOptions(key: RelationKey, enabled = true) {
  const relation = RELATIONS[key];
  return useQuery({
    queryKey: queryKeys.network.options(key),
    queryFn: async ({ signal }): Promise<FilterOption[]> => {
      const result = await api.list<RelationRow>(relation.endpoint, relation.query, signal);
      return result.data.map((row) => ({ value: row.id, label: relation.label(row) }));
    },
    enabled,
    staleTime: 5 * 60_000,
  });
}

import { pickParams } from "@/lib/query/params";

/**
 * The five levels of the distribution hierarchy managed on /admin/network.
 * Shared by the server page (prefetch) and the client tables (queries), so
 * both build identical cache keys.
 */
export const NETWORK_TABS = ["zones", "substations", "feeders", "areas", "connections"] as const;
export type NetworkTab = (typeof NETWORK_TABS)[number];

export const NETWORK_META: Record<NetworkTab, { endpoint: string; label: string; noun: string; params: string[] }> = {
  zones: { endpoint: "/zones", label: "Zones", noun: "zone", params: ["page", "search", "city"] },
  substations: { endpoint: "/substations", label: "Substations", noun: "substation", params: ["page", "search", "zoneId", "status"] },
  feeders: { endpoint: "/feeders", label: "Feeders", noun: "feeder", params: ["page", "search", "zoneId", "substationId"] },
  areas: { endpoint: "/areas", label: "Areas", noun: "area", params: ["page", "search", "zoneId", "feederId", "priorityTier"] },
  connections: {
    endpoint: "/connections",
    label: "Connections",
    noun: "connection",
    params: ["page", "search", "areaId", "connectionType", "status"],
  },
};

export const isNetworkTab = (value: unknown): value is NetworkTab =>
  typeof value === "string" && (NETWORK_TABS as readonly string[]).includes(value);

type Source = Parameters<typeof pickParams>[0];

/** Alphabetical by default (connections by meter number, their only name). */
export const networkParams = (source: Source, tab: NetworkTab) => ({
  ...pickParams(source, NETWORK_META[tab].params, { limit: 10 }),
  sortBy: tab === "connections" ? "meterNo" : "name",
  sortOrder: "asc",
});

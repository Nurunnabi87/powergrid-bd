import { pickParams } from "@/lib/query/params";

type Source = Parameters<typeof pickParams>[0];

export type OutageScope = "all" | "mine" | "assigned";

/** Which API endpoint backs each role's outage list. */
export const OUTAGE_ENDPOINT: Record<OutageScope, string> = {
  all: "/outages",
  mine: "/outages/my-reports",
  assigned: "/outages/my-assignments",
};

/** URL → API params for outage lists (shared by server prefetch and client). */
export const outageParams = (source: Source, scope: OutageScope) =>
  scope === "assigned"
    ? // /my-assignments only supports a status filter.
      pickParams(source, ["page", "status"], { limit: 10 })
    : pickParams(source, ["page", "search", "status", "severity", "zoneId", "sortBy", "sortOrder"], { limit: 10 });

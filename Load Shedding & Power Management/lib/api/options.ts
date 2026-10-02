import "server-only";
import { apiList } from "@/lib/api/server";
import type { FilterOption } from "@/components/shared/filter-select";
import type { Zone } from "@/types/domain";

/** Zones as select options (there are only a handful; the API caps at 100). */
export async function zoneOptions(): Promise<FilterOption[]> {
  const zones = await apiList<Zone>("/zones", { query: { limit: 100, sortBy: "name", sortOrder: "asc" } });
  return zones.data.map((zone) => ({ value: zone.id, label: `${zone.name} (${zone.code})` }));
}

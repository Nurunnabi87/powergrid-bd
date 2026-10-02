"use client";

import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DateFilter } from "@/components/shared/date-filter";
import { FilterSelect } from "@/components/shared/filter-select";
import { SearchInput } from "@/components/shared/search-input";
import { useUrlState } from "@/hooks/use-url-state";
import type { PublicZone } from "@/types/domain";

/** URL-bound filters for the public schedule; the list itself renders on the server. */
export function PublicScheduleFilters({ zones, today }: { zones: PublicZone[]; today: string }) {
  const { searchParams, reset, isPending } = useUrlState();
  const hasFilters = ["zoneId", "date", "search"].some((key) => searchParams.get(key));

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center" data-pending={isPending || undefined}>
      <SearchInput placeholder="Search your area or feeder…" className="sm:max-w-sm" />
      <FilterSelect
        param="zoneId"
        label="Zones"
        allLabel="All"
        options={zones.map((zone) => ({ value: zone.id, label: `${zone.name} (${zone.code})` }))}
        className="sm:w-56"
      />
      <DateFilter param="date" label="Schedule date" fallback={today} />
      {hasFilters && (
        <Button variant="ghost" onClick={() => reset()}>
          <RotateCcw /> Reset
        </Button>
      )}
    </div>
  );
}

import { pickParams } from "@/lib/query/params";

type Source = Parameters<typeof pickParams>[0];

/** URL → API params for the admin schedule table. */
export const scheduleParams = (source: Source) =>
  pickParams(source, ["page", "zoneId", "status", "date", "sortBy", "sortOrder"], { limit: 10 });

import { pickParams } from "@/lib/query/params";

type Source = Parameters<typeof pickParams>[0];

/** URL → API params for the admin user table. */
export const userParams = (source: Source) =>
  pickParams(source, ["page", "search", "role", "status", "sortBy", "sortOrder"], { limit: 10 });

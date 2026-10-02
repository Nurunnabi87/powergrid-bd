import { pickParams } from "@/lib/query/params";

type Source = Parameters<typeof pickParams>[0];

export const auditParams = (source: Source) =>
  pickParams(source, ["page", "entityType", "action"], { limit: 15 });

export const contactParams = (source: Source) =>
  pickParams(source, ["page", "search", "isRead"], { limit: 10 });

/** Analytics date range. `to` is inclusive, so it is sent as end-of-day. */
export const rangeParams = (source: Source) => {
  const { from, to } = pickParams(source, ["from", "to"]);
  return {
    ...(from ? { from: `${from}T00:00:00+06:00` } : {}),
    ...(to ? { to: `${to}T23:59:59+06:00` } : {}),
  };
};

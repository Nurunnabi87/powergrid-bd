import { pickParams } from "@/lib/query/params";

type Source = Parameters<typeof pickParams>[0];

/** URL → API params for the notifications list (shared by server and client). */
export const notificationParams = (source: Source) =>
  pickParams(source, ["page", "isRead", "type"], { limit: 10 });

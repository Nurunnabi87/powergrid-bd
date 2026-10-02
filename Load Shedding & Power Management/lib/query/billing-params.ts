import { pickParams } from "@/lib/query/params";

type Source = Parameters<typeof pickParams>[0];

/** URL → API params for bill lists (customer and admin). */
export const billParams = (source: Source) =>
  pickParams(source, ["page", "status", "billingPeriod", "search", "customerId", "sortBy", "sortOrder"], { limit: 10 });

/** URL → API params for payment lists (customer and admin). */
export const paymentParams = (source: Source) =>
  pickParams(source, ["page", "status", "provider", "sortBy", "sortOrder"], { limit: 10 });

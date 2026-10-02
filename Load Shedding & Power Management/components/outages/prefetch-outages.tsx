import type { ReactNode } from "react";
import { HydrationBoundary, QueryClient, dehydrate } from "@tanstack/react-query";
import { apiList } from "@/lib/api/server";
import { queryKeys } from "@/lib/query/keys";
import { OUTAGE_ENDPOINT, outageParams, type OutageScope } from "@/lib/query/outage-params";
import type { Outage } from "@/types/domain";

/**
 * Server component: prefetches the outage page the URL asks for and hands
 * it to the client <OutageList> through the React Query cache.
 */
export async function PrefetchOutages({
  scope,
  searchParams,
  children,
}: {
  scope: OutageScope;
  searchParams: Record<string, string | string[] | undefined>;
  children: ReactNode;
}) {
  const params = outageParams(searchParams, scope);
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: queryKeys.outages.list(scope, params),
    queryFn: () => apiList<Outage>(OUTAGE_ENDPOINT[scope], { query: params }),
  });

  return <HydrationBoundary state={dehydrate(queryClient)}>{children}</HydrationBoundary>;
}

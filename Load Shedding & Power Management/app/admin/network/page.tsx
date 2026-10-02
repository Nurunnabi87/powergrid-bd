import type { Metadata } from "next";
import { HydrationBoundary, QueryClient, dehydrate } from "@tanstack/react-query";
import { NetworkTabs } from "@/components/admin/network/network-tabs";
import { PageHeader } from "@/components/shared/page-header";
import { apiList } from "@/lib/api/server";
import { NETWORK_META, isNetworkTab, networkParams } from "@/lib/network-resources";
import { queryKeys } from "@/lib/query/keys";

export const metadata: Metadata = { title: "Network" };

export default async function AdminNetworkPage({ searchParams }: PageProps<"/admin/network">) {
  const query = await searchParams;
  const tab = isNetworkTab(query.tab) ? query.tab : "zones";
  const params = networkParams(query, tab);

  const queryClient = new QueryClient();
  await queryClient.prefetchQuery({
    queryKey: queryKeys.network.list(tab, params),
    queryFn: () => apiList(NETWORK_META[tab].endpoint, { query: params }),
  });

  return (
    <>
      <PageHeader
        title="Distribution network"
        description="Zone → substation → feeder → area → meter. Records with active children can't be removed."
      />
      <HydrationBoundary state={dehydrate(queryClient)}>
        <NetworkTabs tab={tab} />
      </HydrationBoundary>
    </>
  );
}

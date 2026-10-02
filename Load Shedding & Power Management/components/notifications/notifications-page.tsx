import { HydrationBoundary, QueryClient, dehydrate } from "@tanstack/react-query";
import { NotificationsView } from "@/components/notifications/notifications-view";
import { apiList } from "@/lib/api/server";
import { queryKeys } from "@/lib/query/keys";
import { notificationParams } from "@/lib/query/notification-params";
import type { Notification } from "@/types/domain";

/**
 * Server half of the notifications page (all roles): prefetches the page
 * the URL asks for, so the list renders on first paint, then hands the
 * cache to the client view for filtering and mark-as-read.
 */
export async function NotificationsPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const params = notificationParams(searchParams);
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: queryKeys.notifications.list(params),
    queryFn: () => apiList<Notification>("/notifications/my", { query: params }),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <NotificationsView />
    </HydrationBoundary>
  );
}

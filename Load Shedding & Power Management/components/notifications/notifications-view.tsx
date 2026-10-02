"use client";

import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { BellOff, Check, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { NOTIFICATION_META } from "@/components/notifications/notification-meta";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { FilterSelect } from "@/components/shared/filter-select";
import { PageHeader } from "@/components/shared/page-header";
import { PaginationBar } from "@/components/shared/pagination-bar";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { useUrlState } from "@/hooks/use-url-state";
import { api } from "@/lib/api/client";
import { errorMessage } from "@/lib/api/errors";
import { formatDateTime, formatRelative } from "@/lib/format";
import { queryKeys } from "@/lib/query/keys";
import { notificationParams } from "@/lib/query/notification-params";
import { cn } from "@/lib/utils";
import { NOTIFICATION_TYPES, type Notification } from "@/types/domain";

const READ_OPTIONS = [
  { value: "false", label: "Unread" },
  { value: "true", label: "Read" },
];

export function NotificationsView() {
  const searchParams = useSearchParams();
  const { reset } = useUrlState();
  const params = notificationParams(searchParams);

  const query = useQuery({
    queryKey: queryKeys.notifications.list(params),
    queryFn: ({ signal }) => api.list<Notification>("/notifications/my", params, signal),
    placeholderData: (previous) => previous,
  });

  const markOne = useApiMutation({
    mutationFn: (id: string) => api.patch(`/notifications/${id}/read`),
    invalidate: [queryKeys.notifications.all],
  });

  const markAll = useApiMutation({
    mutationFn: () => api.patch<{ markedAsRead: number }>("/notifications/read-all"),
    invalidate: [queryKeys.notifications.all],
    successMessage: (result) => `${result.data.markedAsRead} notification(s) marked as read`,
  });

  const hasFilters = Boolean(params.isRead || params.type);

  return (
    <>
      <PageHeader
        title="Notifications"
        description="Schedule changes, outage updates and payment receipts, newest first."
        actions={
          <Button variant="outline" onClick={() => markAll.mutate()} disabled={markAll.isPending}>
            <CheckCheck /> Mark all as read
          </Button>
        }
      />

      <div className="flex flex-col gap-2 sm:flex-row">
        <FilterSelect param="isRead" label="Status" options={READ_OPTIONS} allLabel="All" />
        <FilterSelect param="type" label="Type" options={NOTIFICATION_TYPES} allLabel="All" className="sm:w-56" />
      </div>

      {query.isPending ? (
        <Card className="divide-y py-0">
          {Array.from({ length: 5 }, (_, index) => (
            <div key={index} className="flex gap-4 p-4">
              <Skeleton className="size-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-3 w-3/4" />
              </div>
            </div>
          ))}
        </Card>
      ) : query.isError ? (
        <ErrorState message={errorMessage(query.error)} onRetry={() => query.refetch()} />
      ) : query.data.data.length === 0 ? (
        <EmptyState
          icon={BellOff}
          title={hasFilters ? "No notifications match these filters" : "No notifications yet"}
          description={
            hasFilters
              ? "Try clearing the filters to see everything."
              : "You'll be notified here about schedules, outages and payments."
          }
          action={hasFilters ? <Button variant="outline" onClick={() => reset()}>Clear filters</Button> : undefined}
        />
      ) : (
        <>
          <Card className={cn("divide-y gap-0 py-0 transition-opacity", query.isFetching && "opacity-60")}>
            {query.data.data.map((notification) => {
              const meta = NOTIFICATION_META[notification.type];
              return (
                <article
                  key={notification.id}
                  className={cn("flex gap-4 p-4 sm:p-5", !notification.isRead && "bg-primary/[0.04]")}
                >
                  <span className={cn("flex size-10 shrink-0 items-center justify-center rounded-full", meta.className)}>
                    <meta.icon className="size-5" aria-hidden />
                  </span>
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-medium">{notification.title}</h2>
                      {!notification.isRead && (
                        <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold text-primary-foreground uppercase">
                          New
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{notification.message}</p>
                    <p className="text-xs text-muted-foreground">
                      <time dateTime={notification.createdAt} title={formatDateTime(notification.createdAt)}>
                        {formatRelative(notification.createdAt)}
                      </time>
                    </p>
                  </div>
                  {!notification.isRead && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="shrink-0"
                      onClick={() => markOne.mutate(notification.id)}
                      disabled={markOne.isPending}
                      aria-label={`Mark "${notification.title}" as read`}
                    >
                      <Check />
                    </Button>
                  )}
                </article>
              );
            })}
          </Card>
          <PaginationBar meta={query.data.meta} noun="notifications" />
        </>
      )}
    </>
  );
}

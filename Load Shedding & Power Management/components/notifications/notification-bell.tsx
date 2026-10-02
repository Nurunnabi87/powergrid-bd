"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Bell, BellOff, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import { NOTIFICATION_META } from "@/components/notifications/notification-meta";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { api } from "@/lib/api/client";
import { formatRelative } from "@/lib/format";
import { queryKeys } from "@/lib/query/keys";
import { cn } from "@/lib/utils";
import type { Notification } from "@/types/domain";

/** Header bell: unread count, the five latest unread items, mark-all-read. */
export function NotificationBell({ viewAllHref }: { viewAllHref: string }) {
  const { data, isPending } = useQuery({
    queryKey: queryKeys.notifications.unread(),
    queryFn: ({ signal }) => api.list<Notification>("/notifications/my", { isRead: "false", limit: 5 }, signal),
    // Near-real-time without websockets: poll once a minute.
    refetchInterval: 60_000,
  });

  const markAll = useApiMutation({
    mutationFn: () => api.patch<{ markedAsRead: number }>("/notifications/read-all"),
    invalidate: [queryKeys.notifications.all],
    successMessage: "All notifications marked as read",
  });

  const unread = data?.meta.total ?? 0;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label={unread ? `Notifications, ${unread} unread` : "Notifications"}
        >
          <Bell />
          {unread > 0 && (
            <span className="absolute top-1 right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] leading-none font-semibold text-white tabular-nums">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[min(22rem,calc(100vw-2rem))] p-0">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <p className="font-medium">Notifications</p>
          {unread > 0 && (
            <Button variant="ghost" size="sm" onClick={() => markAll.mutate()} disabled={markAll.isPending}>
              <CheckCheck /> Mark all read
            </Button>
          )}
        </div>

        <div className="max-h-80 overflow-y-auto">
          {isPending ? (
            <div className="space-y-3 p-4">
              {[0, 1, 2].map((index) => (
                <div key={index} className="flex gap-3">
                  <Skeleton className="size-8 rounded-full" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : data && data.data.length > 0 ? (
            <ul className="divide-y">
              {data.data.map((notification) => {
                const meta = NOTIFICATION_META[notification.type];
                return (
                  <li key={notification.id} className="flex gap-3 px-4 py-3">
                    <span className={cn("flex size-8 shrink-0 items-center justify-center rounded-full", meta.className)}>
                      <meta.icon className="size-4" aria-hidden />
                    </span>
                    <div className="min-w-0 space-y-0.5">
                      <p className="text-sm font-medium">{notification.title}</p>
                      <p className="line-clamp-2 text-xs text-muted-foreground">{notification.message}</p>
                      <p className="text-xs text-muted-foreground">{formatRelative(notification.createdAt)}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
              <BellOff className="size-8 text-muted-foreground" aria-hidden />
              <p className="text-sm font-medium">You&apos;re all caught up</p>
              <p className="text-xs text-muted-foreground">No unread notifications.</p>
            </div>
          )}
        </div>

        <div className="border-t p-2">
          <Button variant="ghost" className="w-full" asChild>
            <Link href={viewAllHref}>View all notifications</Link>
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

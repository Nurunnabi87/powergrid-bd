"use client";

import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Check, Mail, MailOpen, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { FilterSelect } from "@/components/shared/filter-select";
import { PaginationBar } from "@/components/shared/pagination-bar";
import { SearchInput } from "@/components/shared/search-input";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { api } from "@/lib/api/client";
import { errorMessage } from "@/lib/api/errors";
import { formatDateTime, formatRelative } from "@/lib/format";
import { queryKeys } from "@/lib/query/keys";
import { contactParams } from "@/lib/query/report-params";
import { cn } from "@/lib/utils";
import type { ContactMessage } from "@/types/domain";

const READ_OPTIONS = [
  { value: "false", label: "Unread" },
  { value: "true", label: "Read" },
];

/** Messages sent from the public contact form. */
export function ContactInbox() {
  const searchParams = useSearchParams();
  const params = contactParams(searchParams);

  const query = useQuery({
    queryKey: queryKeys.admin.contactMessages(params),
    queryFn: ({ signal }) => api.list<ContactMessage>("/admin/contact-messages", params, signal),
    placeholderData: (previous) => previous,
  });

  const markRead = useApiMutation<unknown, string>({
    mutationFn: (id) => api.patch(`/admin/contact-messages/${id}/read`),
    invalidate: [["admin", "contact-messages"]],
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row">
        <SearchInput placeholder="Search name, email or subject…" />
        <FilterSelect param="isRead" label="Status" options={READ_OPTIONS} />
      </div>
      {query.isPending ? (
        <div className="space-y-3">
          {[0, 1, 2].map((index) => (
            <Skeleton key={index} className="h-28 w-full rounded-xl" />
          ))}
        </div>
      ) : query.isError ? (
        <ErrorState message={errorMessage(query.error)} onRetry={() => query.refetch()} />
      ) : query.data.data.length === 0 ? (
        <EmptyState icon={MailOpen} title="Inbox is empty" description="Messages from the public contact page will appear here." />
      ) : (
        <>
          <ul className={cn("space-y-3 transition-opacity", query.isFetching && "opacity-60")}>
            {query.data.data.map((message) => (
              <li key={message.id}>
                <Card className={cn("gap-3 p-4 sm:p-5", !message.isRead && "border-primary/40 bg-primary/[0.03]")}>
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-medium">
                        {!message.isRead && <span className="mr-2 inline-block size-2 rounded-full bg-primary align-middle" aria-label="Unread" />}
                        {message.subject}
                      </p>
                      <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                        <span>{message.name}</span>
                        <a href={`mailto:${message.email}`} className="inline-flex items-center gap-1 hover:text-foreground">
                          <Mail className="size-3.5" aria-hidden /> {message.email}
                        </a>
                        {message.phone && (
                          <span className="inline-flex items-center gap-1">
                            <Phone className="size-3.5" aria-hidden /> {message.phone}
                          </span>
                        )}
                      </p>
                    </div>
                    <time dateTime={message.createdAt} title={formatDateTime(message.createdAt)} className="text-xs text-muted-foreground">
                      {formatRelative(message.createdAt)}
                    </time>
                  </div>
                  <p className="text-sm whitespace-pre-line">{message.message}</p>
                  {!message.isRead && (
                    <Button variant="outline" size="sm" className="w-fit" onClick={() => markRead.mutate(message.id)} disabled={markRead.isPending}>
                      <Check /> Mark as read
                    </Button>
                  )}
                </Card>
              </li>
            ))}
          </ul>
          <PaginationBar meta={query.data.meta} noun="messages" />
        </>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { Ban, MoreHorizontal, RotateCcw, ShieldCheck, UserCog, UsersRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { DataTable } from "@/components/shared/data-table";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { FilterSelect } from "@/components/shared/filter-select";
import { PaginationBar } from "@/components/shared/pagination-bar";
import { SearchInput } from "@/components/shared/search-input";
import { AccountStatusBadge, StatusBadge } from "@/components/shared/status-badge";
import { UserAvatar } from "@/components/shared/user-avatar";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { useSession } from "@/hooks/use-session";
import { useUrlState } from "@/hooks/use-url-state";
import { api } from "@/lib/api/client";
import { errorMessage } from "@/lib/api/errors";
import { ROLE_LABEL } from "@/lib/auth/roles";
import { formatDate } from "@/lib/format";
import { queryKeys } from "@/lib/query/keys";
import { userParams } from "@/lib/query/user-params";
import { USER_ROLES, USER_STATUSES, type AdminUser, type UserRole } from "@/types/domain";

type Pending =
  | { kind: "role"; user: AdminUser; role: UserRole }
  | { kind: "status"; user: AdminUser; status: "ACTIVE" | "BANNED" };

const ROLE_OPTIONS = USER_ROLES.map((role) => ({ value: role, label: ROLE_LABEL[role] }));

export function UsersTable() {
  const searchParams = useSearchParams();
  const { reset } = useUrlState();
  const { user: me } = useSession();
  const params = userParams(searchParams);
  const [pending, setPending] = useState<Pending | null>(null);

  const query = useQuery({
    queryKey: queryKeys.users.list(params),
    queryFn: ({ signal }) => api.list<AdminUser>("/admin/users", params, signal),
    placeholderData: (previous) => previous,
  });

  const changeRole = useApiMutation<unknown, { id: string; role: UserRole }>({
    mutationFn: ({ id, role }) => api.patch(`/admin/users/${id}/role`, { role }),
    invalidate: [queryKeys.users.all],
    successMessage: "Role updated",
    onSuccess: () => setPending(null),
  });

  const changeStatus = useApiMutation<unknown, { id: string; status: "ACTIVE" | "BANNED" }>({
    mutationFn: ({ id, status }) => api.patch(`/admin/users/${id}/status`, { status }),
    invalidate: [queryKeys.users.all],
    successMessage: "Account status updated",
    onSuccess: () => setPending(null),
  });

  const columns: ColumnDef<AdminUser, unknown>[] = [
    {
      id: "user",
      header: "User",
      cell: ({ row }) => (
        <div className="flex min-w-52 items-center gap-3">
          <UserAvatar name={row.original.name} src={row.original.avatarUrl} size={36} />
          <div className="min-w-0">
            <p className="truncate font-medium">
              {row.original.name}
              {row.original.id === me?.id && <span className="ml-1.5 text-xs text-muted-foreground">(you)</span>}
            </p>
            <p className="truncate text-xs text-muted-foreground">{row.original.email}</p>
          </div>
        </div>
      ),
    },
    {
      id: "role",
      header: "Role",
      cell: ({ row }) => <StatusBadge status={row.original.role} label={ROLE_LABEL[row.original.role]} dot={false} className="bg-secondary text-secondary-foreground ring-border" />,
    },
    { id: "status", header: "Status", cell: ({ row }) => <AccountStatusBadge status={row.original.status} /> },
    {
      id: "activity",
      header: "Activity",
      cell: ({ row }) => (
        <span className="text-sm whitespace-nowrap text-muted-foreground">
          {row.original._count.connections} meter(s) · {row.original._count.reportedOutages} report(s)
        </span>
      ),
    },
    { id: "phone", header: "Phone", cell: ({ row }) => <span className="text-sm">{row.original.phone ?? "—"}</span> },
    {
      id: "joined",
      header: "Joined",
      cell: ({ row }) => <span className="text-sm whitespace-nowrap text-muted-foreground">{formatDate(row.original.createdAt)}</span>,
    },
    {
      id: "actions",
      header: () => <span className="sr-only">Actions</span>,
      cell: ({ row }) => {
        const user = row.original;
        if (user.id === me?.id) return null;
        return (
          <div className="flex justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" aria-label={`Manage ${user.name}`}>
                  <MoreHorizontal />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel className="text-xs text-muted-foreground">Change role</DropdownMenuLabel>
                {USER_ROLES.filter((role) => role !== user.role).map((role) => (
                  <DropdownMenuItem key={role} onSelect={() => setPending({ kind: "role", user, role })}>
                    <UserCog /> Make {ROLE_LABEL[role]}
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                {user.status === "ACTIVE" ? (
                  <DropdownMenuItem variant="destructive" onSelect={() => setPending({ kind: "status", user, status: "BANNED" })}>
                    <Ban /> Ban account
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem onSelect={() => setPending({ kind: "status", user, status: "ACTIVE" })}>
                    <ShieldCheck /> Reinstate account
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];

  const hasFilters = ["search", "role", "status"].some((key) => searchParams.get(key));

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <SearchInput placeholder="Search name, email or phone…" />
        <FilterSelect param="role" label="Roles" options={ROLE_OPTIONS} />
        <FilterSelect param="status" label="Status" options={USER_STATUSES} />
        {hasFilters && (
          <Button variant="ghost" onClick={() => reset()}>
            <RotateCcw /> Reset
          </Button>
        )}
      </div>

      {query.isError && !query.data ? (
        <ErrorState message={errorMessage(query.error)} onRetry={() => query.refetch()} />
      ) : (
        <>
          <DataTable
            columns={columns}
            data={query.data?.data ?? []}
            isLoading={query.isPending}
            isFetching={query.isFetching}
            getRowId={(user) => user.id}
            empty={
              <EmptyState
                icon={UsersRound}
                title={hasFilters ? "No users match these filters" : "No users yet"}
                description={hasFilters ? "Try a different search or role." : "Registered accounts will appear here."}
                action={hasFilters ? <Button variant="outline" onClick={() => reset()}>Clear filters</Button> : undefined}
              />
            }
          />
          {query.data && <PaginationBar meta={query.data.meta} noun="users" />}
        </>
      )}

      <ConfirmDialog
        open={pending?.kind === "role"}
        onOpenChange={(open) => !open && setPending(null)}
        title={pending?.kind === "role" ? `Make ${pending.user.name} a ${ROLE_LABEL[pending.role]}?` : ""}
        description={
          pending?.kind === "role" && pending.role === "TECHNICIAN"
            ? "A technician profile is created so they can be dispatched to outages."
            : "Their access changes on their next request — dashboards and permissions follow the new role."
        }
        confirmLabel="Change role"
        loading={changeRole.isPending}
        onConfirm={() => pending?.kind === "role" && changeRole.mutate({ id: pending.user.id, role: pending.role })}
      />
      <ConfirmDialog
        open={pending?.kind === "status"}
        onOpenChange={(open) => !open && setPending(null)}
        title={pending?.kind === "status" ? (pending.status === "BANNED" ? `Ban ${pending.user.name}?` : `Reinstate ${pending.user.name}?`) : ""}
        description={
          pending?.kind === "status" && pending.status === "BANNED"
            ? "They are signed out everywhere immediately and cannot log in until reinstated."
            : "They will be able to log in again."
        }
        confirmLabel={pending?.kind === "status" && pending.status === "BANNED" ? "Ban account" : "Reinstate"}
        destructive={pending?.kind === "status" && pending.status === "BANNED"}
        loading={changeStatus.isPending}
        onConfirm={() => pending?.kind === "status" && changeStatus.mutate({ id: pending.user.id, status: pending.status })}
      />
    </div>
  );
}

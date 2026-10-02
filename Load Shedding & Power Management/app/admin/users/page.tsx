import type { Metadata } from "next";
import { HydrationBoundary, QueryClient, dehydrate } from "@tanstack/react-query";
import { UsersTable } from "@/components/admin/users-table";
import { PageHeader } from "@/components/shared/page-header";
import { apiList } from "@/lib/api/server";
import { queryKeys } from "@/lib/query/keys";
import { userParams } from "@/lib/query/user-params";
import type { AdminUser } from "@/types/domain";

export const metadata: Metadata = { title: "Users" };

export default async function AdminUsersPage({ searchParams }: PageProps<"/admin/users">) {
  const params = userParams(await searchParams);
  const queryClient = new QueryClient();
  await queryClient.prefetchQuery({
    queryKey: queryKeys.users.list(params),
    queryFn: () => apiList<AdminUser>("/admin/users", { query: params }),
  });

  return (
    <>
      <PageHeader
        title="Users & roles"
        description="Promote customers to technicians or admins, and ban accounts. Changes take effect on the user's next request."
      />
      <HydrationBoundary state={dehydrate(queryClient)}>
        <UsersTable />
      </HydrationBoundary>
    </>
  );
}

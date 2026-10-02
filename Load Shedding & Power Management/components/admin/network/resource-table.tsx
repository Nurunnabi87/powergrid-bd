"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { Network, Pencil, Plus, RotateCcw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ResourceFormDialog } from "@/components/admin/network/resource-form-dialog";
import { RESOURCE_CONFIGS, type FilterSpec } from "@/components/admin/network/resource-configs";
import { useRelationOptions } from "@/components/admin/network/use-relation-options";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { DataTable } from "@/components/shared/data-table";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { FilterSelect } from "@/components/shared/filter-select";
import { PaginationBar } from "@/components/shared/pagination-bar";
import { SearchInput } from "@/components/shared/search-input";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { useUrlState } from "@/hooks/use-url-state";
import { api } from "@/lib/api/client";
import { errorMessage } from "@/lib/api/errors";
import { NETWORK_META, networkParams, type NetworkTab } from "@/lib/network-resources";
import { queryKeys } from "@/lib/query/keys";

type Row = { id: string };

function ResourceFilter({ spec }: { spec: FilterSpec }) {
  const relation = useRelationOptions(spec.relation ?? "zones", Boolean(spec.relation));
  if (spec.relation) return <FilterSelect param={spec.param} label={spec.label} options={relation.data ?? []} />;
  return <FilterSelect param={spec.param} label={spec.label} options={spec.options ?? []} />;
}

/**
 * One table for all five hierarchy levels: the config supplies columns,
 * filters and form fields; this component supplies URL-synced paging,
 * search, create/edit dialogs and guarded deletes.
 */
export function ResourceTable({ tab }: { tab: NetworkTab }) {
  const config = RESOURCE_CONFIGS[tab];
  const meta = NETWORK_META[tab];
  const searchParams = useSearchParams();
  const { reset } = useUrlState();
  const params = networkParams(searchParams, tab);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<{ id: string; values: Record<string, string> } | null>(null);
  const [deleting, setDeleting] = useState<Row | null>(null);

  const query = useQuery({
    queryKey: queryKeys.network.list(tab, params),
    queryFn: ({ signal }) => api.list<Row>(meta.endpoint, params, signal),
    placeholderData: (previous) => previous,
  });

  const remove = useApiMutation<unknown, string>({
    mutationFn: (id) => api.delete(`${meta.endpoint}/${id}`),
    invalidate: [queryKeys.network.all],
    successMessage: `${meta.noun.charAt(0).toUpperCase()}${meta.noun.slice(1)} removed`,
    // 409 = it still has children (or unpaid bills); the toast explains why.
    onSuccess: () => setDeleting(null),
    onError: () => setDeleting(null),
  });

  const columns: ColumnDef<Row, unknown>[] = [
    ...config.columns,
    {
      id: "actions",
      header: () => <span className="sr-only">Actions</span>,
      cell: ({ row }) => (
        <div className="flex justify-end gap-1">
          <Button
            variant="ghost"
            size="icon"
            aria-label={`Edit ${config.label(row.original)}`}
            onClick={() => {
              setEditing({ id: row.original.id, values: config.toForm(row.original) });
              setFormOpen(true);
            }}
          >
            <Pencil />
          </Button>
          <Button variant="ghost" size="icon" aria-label={`Delete ${config.label(row.original)}`} onClick={() => setDeleting(row.original)}>
            <Trash2 className="text-destructive" />
          </Button>
        </div>
      ),
    },
  ];

  const hasFilters = ["search", ...config.filters.map((filter) => filter.param)].some((key) => searchParams.get(key));

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 lg:flex-row lg:flex-wrap lg:items-center">
        <SearchInput placeholder={config.searchPlaceholder} />
        {config.filters.map((spec) => (
          <ResourceFilter key={spec.param} spec={spec} />
        ))}
        {hasFilters && (
          <Button variant="ghost" onClick={() => reset(["tab"])}>
            <RotateCcw /> Reset
          </Button>
        )}
        <Button
          className="lg:ml-auto"
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
        >
          <Plus /> Add {meta.noun}
        </Button>
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
            getRowId={(row) => row.id}
            empty={
              <EmptyState
                icon={Network}
                title={hasFilters ? `No ${meta.label.toLowerCase()} match these filters` : `No ${meta.label.toLowerCase()} yet`}
                description={hasFilters ? "Try clearing the filters." : `Add the first ${meta.noun} to build out the network.`}
                action={hasFilters ? <Button variant="outline" onClick={() => reset(["tab"])}>Clear filters</Button> : undefined}
              />
            }
          />
          {query.data && <PaginationBar meta={query.data.meta} noun={meta.label.toLowerCase()} />}
        </>
      )}

      <ResourceFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        endpoint={meta.endpoint}
        noun={meta.noun}
        fields={config.fields}
        schema={config.schema}
        defaults={config.defaults}
        editing={editing}
      />
      <ConfirmDialog
        open={deleting !== null}
        onOpenChange={(open) => !open && setDeleting(null)}
        title={deleting ? `Remove ${config.label(deleting)}?` : ""}
        description={`The ${meta.noun} is archived (soft delete). It can't be removed while it still has active child records.`}
        confirmLabel="Remove"
        destructive
        loading={remove.isPending}
        onConfirm={() => deleting && remove.mutate(deleting.id)}
      />
    </div>
  );
}

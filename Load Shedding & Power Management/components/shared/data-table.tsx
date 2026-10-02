"use client";

import type { ReactNode } from "react";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

interface DataTableProps<TData> {
  columns: ColumnDef<TData, unknown>[];
  data: TData[];
  /** First load: rows are replaced by skeletons. */
  isLoading?: boolean;
  /** Background refetch (filter change): rows dim instead of disappearing. */
  isFetching?: boolean;
  /** Rendered instead of the table when there are no rows. */
  empty: ReactNode;
  getRowId?: (row: TData) => string;
  className?: string;
}

/**
 * Generic, server-paginated table. Sorting, filtering and paging are done
 * by the API (driven from the URL), so the table only renders the page it
 * is given. Wide tables scroll inside their card, never the whole page.
 */
export function DataTable<TData>({
  columns,
  data,
  isLoading = false,
  isFetching = false,
  empty,
  getRowId,
  className,
}: DataTableProps<TData>) {
  // TanStack Table returns fresh functions each render by design, so the
  // React Compiler skips memoising this component (its lint notice is expected).
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
    getRowId,
  });

  if (!isLoading && data.length === 0) return <>{empty}</>;

  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border bg-card transition-opacity",
        isFetching && !isLoading && "opacity-60",
        className
      )}
      aria-busy={isLoading || isFetching}
    >
      <Table>
        <TableHeader className="bg-muted/50">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id} className="hover:bg-transparent">
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id} className="h-10 px-4 text-xs font-medium tracking-wide text-muted-foreground uppercase">
                  {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {isLoading
            ? Array.from({ length: 6 }, (_, rowIndex) => (
                <TableRow key={`skeleton-${rowIndex}`}>
                  {columns.map((_, cellIndex) => (
                    <TableCell key={cellIndex} className="px-4 py-3">
                      <Skeleton className="h-4 w-full max-w-40" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            : table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="px-4 py-3 align-middle">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
        </TableBody>
      </Table>
    </div>
  );
}

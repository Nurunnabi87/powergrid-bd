import { PageHeaderSkeleton, StatGridSkeleton, TableSkeleton, ToolbarSkeleton } from "@/components/shared/skeletons";

export default function Loading() {
  return (
    <div className="space-y-6">
      <PageHeaderSkeleton />
      <StatGridSkeleton count={3} />
      <ToolbarSkeleton filters={1} />
      <TableSkeleton columns={6} />
    </div>
  );
}

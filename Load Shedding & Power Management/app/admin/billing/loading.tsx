import { Skeleton } from "@/components/ui/skeleton";
import { PageHeaderSkeleton, StatGridSkeleton, TableSkeleton, ToolbarSkeleton } from "@/components/shared/skeletons";

export default function Loading() {
  return (
    <div className="space-y-6">
      <PageHeaderSkeleton withAction />
      <StatGridSkeleton />
      <Skeleton className="h-9 w-56" />
      <ToolbarSkeleton filters={2} />
      <TableSkeleton columns={7} />
    </div>
  );
}

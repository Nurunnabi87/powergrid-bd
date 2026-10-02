import { Skeleton } from "@/components/ui/skeleton";
import { PageHeaderSkeleton, TableSkeleton, ToolbarSkeleton } from "@/components/shared/skeletons";

export default function Loading() {
  return (
    <div className="space-y-6">
      <PageHeaderSkeleton />
      <Skeleton className="h-9 w-full max-w-xl" />
      <ToolbarSkeleton filters={2} />
      <TableSkeleton columns={5} />
    </div>
  );
}

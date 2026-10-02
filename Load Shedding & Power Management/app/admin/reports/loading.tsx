import { Skeleton } from "@/components/ui/skeleton";
import { ChartCardSkeleton, PageHeaderSkeleton, StatGridSkeleton } from "@/components/shared/skeletons";

export default function Loading() {
  return (
    <div className="space-y-6">
      <PageHeaderSkeleton />
      <Skeleton className="h-9 w-80" />
      <StatGridSkeleton count={3} />
      <div className="grid gap-6 xl:grid-cols-2">
        <ChartCardSkeleton />
        <ChartCardSkeleton />
      </div>
    </div>
  );
}

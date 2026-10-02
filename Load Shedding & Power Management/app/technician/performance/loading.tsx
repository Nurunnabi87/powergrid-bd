import { ChartCardSkeleton, PageHeaderSkeleton } from "@/components/shared/skeletons";
import { StatCardSkeleton } from "@/components/shared/stat-card";

export default function Loading() {
  return (
    <div className="space-y-6">
      <PageHeaderSkeleton />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }, (_, index) => (
          <StatCardSkeleton key={index} />
        ))}
      </div>
      <div className="grid gap-6 xl:grid-cols-5">
        <div className="xl:col-span-3">
          <ChartCardSkeleton />
        </div>
        <div className="xl:col-span-2">
          <ChartCardSkeleton />
        </div>
      </div>
    </div>
  );
}

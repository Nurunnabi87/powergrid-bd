import { ChartCardSkeleton, ListCardSkeleton, PageHeaderSkeleton, StatGridSkeleton } from "@/components/shared/skeletons";

export default function Loading() {
  return (
    <div className="space-y-6">
      <PageHeaderSkeleton withAction />
      <StatGridSkeleton />
      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <ChartCardSkeleton height="h-56" />
        </div>
        <div className="lg:col-span-2">
          <ListCardSkeleton />
        </div>
      </div>
    </div>
  );
}

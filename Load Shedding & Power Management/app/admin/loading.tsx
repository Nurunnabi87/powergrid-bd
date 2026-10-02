import { ChartCardSkeleton, ListCardSkeleton, PageHeaderSkeleton, StatGridSkeleton } from "@/components/shared/skeletons";

export default function Loading() {
  return (
    <div className="space-y-6">
      <PageHeaderSkeleton withAction />
      <StatGridSkeleton count={8} />
      <ListCardSkeleton items={3} />
      <ChartCardSkeleton />
      <div className="grid gap-6 xl:grid-cols-2">
        <ChartCardSkeleton />
        <ChartCardSkeleton />
      </div>
    </div>
  );
}

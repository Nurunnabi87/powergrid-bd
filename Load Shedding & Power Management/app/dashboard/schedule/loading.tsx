import { Skeleton } from "@/components/ui/skeleton";
import { ListCardSkeleton, PageHeaderSkeleton } from "@/components/shared/skeletons";

export default function Loading() {
  return (
    <div className="space-y-6">
      <PageHeaderSkeleton withAction />
      <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
        <div className="space-y-3">
          <Skeleton className="h-4 w-40" />
          {Array.from({ length: 4 }, (_, index) => (
            <Skeleton key={index} className="h-20 w-full rounded-xl" />
          ))}
        </div>
        <ListCardSkeleton items={3} />
      </div>
    </div>
  );
}

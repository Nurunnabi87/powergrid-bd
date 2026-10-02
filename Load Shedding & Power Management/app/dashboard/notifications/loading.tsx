import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeaderSkeleton, ToolbarSkeleton } from "@/components/shared/skeletons";

export default function Loading() {
  return (
    <div className="space-y-6">
      <PageHeaderSkeleton withAction />
      <ToolbarSkeleton />
      <Card className="divide-y gap-0 py-0">
        {Array.from({ length: 6 }, (_, index) => (
          <div key={index} className="flex gap-4 p-5">
            <Skeleton className="size-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-3 w-3/4" />
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
}

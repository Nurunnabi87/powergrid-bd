import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeaderSkeleton } from "@/components/shared/skeletons";

export default function Loading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-7 w-36" />
      <PageHeaderSkeleton />
      <Card className="max-w-3xl">
        <CardContent className="space-y-8">
          <div className="flex gap-2">
            {[0, 1, 2].map((index) => (
              <Skeleton key={index} className="h-8 flex-1 rounded-full" />
            ))}
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
          <Skeleton className="h-9 w-full" />
        </CardContent>
      </Card>
    </div>
  );
}

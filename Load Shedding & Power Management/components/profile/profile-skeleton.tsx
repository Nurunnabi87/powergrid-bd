import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeaderSkeleton } from "@/components/shared/skeletons";

export function ProfileSkeleton() {
  return (
    <div className="space-y-6">
      <PageHeaderSkeleton />
      <div className="grid gap-6 lg:grid-cols-[20rem_1fr]">
        <Card>
          <CardHeader className="items-center gap-3">
            <Skeleton className="mx-auto size-22 rounded-full" />
            <Skeleton className="mx-auto h-5 w-32" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-36 w-full" />
          </CardContent>
        </Card>
        <div className="space-y-6">
          {[0, 1].map((card) => (
            <Card key={card}>
              <CardHeader className="space-y-2">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-4 w-64" />
              </CardHeader>
              <CardContent className="space-y-4">
                {Array.from({ length: 3 }, (_, index) => (
                  <div key={index} className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-9 w-full" />
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

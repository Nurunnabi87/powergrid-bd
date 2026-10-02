import { Skeleton } from "@/components/ui/skeleton";

/** Shared skeleton for public pages while their (cached) API data loads. */
export default function Loading() {
  return (
    <>
      <div className="border-b">
        <div className="mx-auto max-w-7xl space-y-4 px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-12 w-full max-w-2xl" />
          <Skeleton className="h-5 w-full max-w-xl" />
          <div className="flex gap-3 pt-2">
            <Skeleton className="h-11 w-48" />
            <Skeleton className="h-11 w-40" />
          </div>
        </div>
      </div>
      <div className="mx-auto grid max-w-7xl gap-4 px-4 py-12 sm:grid-cols-2 sm:px-6 lg:grid-cols-3 lg:px-8">
        {Array.from({ length: 6 }, (_, index) => (
          <Skeleton key={index} className="h-40 w-full rounded-xl" />
        ))}
      </div>
    </>
  );
}

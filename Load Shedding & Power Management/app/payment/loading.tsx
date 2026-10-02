import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";

/** Shown while the payment is verified with the gateway. */
export default function Loading() {
  return (
    <Card>
      <CardHeader className="items-center gap-3 text-center">
        <Spinner className="mx-auto size-10 text-muted-foreground" />
        <p className="text-lg font-semibold">Confirming your payment…</p>
        <p className="text-sm text-muted-foreground">We&apos;re checking with the payment gateway. Please don&apos;t close this page.</p>
      </CardHeader>
      <CardContent className="space-y-2">
        {Array.from({ length: 4 }, (_, index) => (
          <Skeleton key={index} className="h-9 w-full" />
        ))}
      </CardContent>
    </Card>
  );
}

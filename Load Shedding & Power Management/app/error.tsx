"use client";

import { RouteError } from "@/components/shared/route-error";

/** Catches render errors in any route without a closer boundary. */
export default function Error({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <main className="flex flex-1 flex-col">
      <RouteError error={error} retry={retry} />
    </main>
  );
}

"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

/** Re-runs the server component (e.g. to re-verify a payment). */
export function RefreshButton({ label = "Check again" }: { label?: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <Button variant="outline" onClick={() => startTransition(() => router.refresh())} disabled={isPending}>
      <RefreshCw className={isPending ? "animate-spin" : undefined} /> {label}
    </Button>
  );
}

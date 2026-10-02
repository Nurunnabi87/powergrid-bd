"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Home, RotateCcw, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RouteErrorProps {
  error: Error & { digest?: string };
  retry: () => void;
  homeHref?: string;
  homeLabel?: string;
}

/**
 * Body of every error.tsx boundary. Server errors arrive with a generic
 * message in production, so the copy stays human and the digest is shown
 * as a reference for support.
 */
export function RouteError({ error, retry, homeHref = "/", homeLabel = "Go home" }: RouteErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div role="alert" className="flex flex-1 flex-col items-center justify-center px-4 py-16">
      <div className="flex max-w-md flex-col items-center gap-5 text-center">
        <span className="flex size-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
          <TriangleAlert className="size-7" aria-hidden />
        </span>
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold tracking-tight">We hit a fault on this page</h2>
          <p className="text-muted-foreground">
            Something went wrong while loading this page. It may be a temporary problem with the
            service — trying again usually helps.
          </p>
          {error.digest && (
            <p className="font-mono text-xs text-muted-foreground">Reference: {error.digest}</p>
          )}
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button onClick={() => retry()}>
            <RotateCcw /> Try again
          </Button>
          <Button variant="outline" asChild>
            <Link href={homeHref}>
              <Home /> {homeLabel}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect } from "react";
import Link from "next/link";
import "./globals.css";

/**
 * Last-resort boundary for errors in the root layout itself. It replaces the
 * whole document, so it renders its own <html> and <body>.
 */
export default function GlobalError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body className="flex min-h-screen items-center justify-center bg-background px-4 font-sans text-foreground antialiased">
        <title>Something went wrong | PowerGrid BD</title>
        <main role="alert" className="flex max-w-md flex-col items-center gap-5 text-center">
          <span className="flex size-14 items-center justify-center rounded-2xl bg-destructive/10 text-2xl" aria-hidden>
            ⚡
          </span>
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight">PowerGrid BD is having trouble</h1>
            <p className="text-muted-foreground">
              An unexpected error stopped the app from loading. Please try again in a moment.
            </p>
            {error.digest && <p className="font-mono text-xs text-muted-foreground">Reference: {error.digest}</p>}
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => retry()}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/85"
            >
              Try again
            </button>
            <Link href="/" className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted">
              Go home
            </Link>
          </div>
        </main>
      </body>
    </html>
  );
}

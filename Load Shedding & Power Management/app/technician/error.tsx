"use client";

import { RouteError } from "@/components/shared/route-error";

/** Error boundary for this dashboard: the shell stays, only the page fails. */
export default function DashboardError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return <RouteError error={error} retry={retry} homeHref="/technician" homeLabel="Back to my jobs" />;
}

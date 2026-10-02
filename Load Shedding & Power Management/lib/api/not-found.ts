import "server-only";
import { notFound } from "next/navigation";
import { isApiError } from "@/lib/api/errors";

/**
 * Runs a detail fetch and turns "missing" or "not yours" (404/403) into the
 * route's not-found page, without revealing whether the record exists.
 * Any other failure propagates to the nearest error.tsx.
 */
export async function orNotFound<T>(request: Promise<T>): Promise<T> {
  try {
    return await request;
  } catch (error) {
    if (isApiError(error) && (error.status === 404 || error.status === 403 || error.status === 400)) {
      notFound();
    }
    throw error;
  }
}

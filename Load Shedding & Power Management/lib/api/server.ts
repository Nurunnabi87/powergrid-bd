import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ApiError } from "@/lib/api/errors";
import { toQueryString } from "@/lib/api/query-string";
import { ACCESS_COOKIE } from "@/lib/auth/tokens";
import { serverConfig } from "@/lib/config";
import type { ApiSuccess, Paginated, QueryParams } from "@/types/api";

export interface ServerRequestOptions {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
  query?: QueryParams;
  /** Attach the signed-in user's token (default true). */
  auth?: boolean;
  /** Use this token instead of the cookie (e.g. straight after login). */
  token?: string;
  /** ISR for public data; user data is never cached. */
  revalidate?: number;
  /**
   * During a render, a 401 means the session is gone: send the user through
   * the sign-out handler (which clears cookies) to the login page. Server
   * actions pass false and surface the error instead.
   */
  redirectOnUnauthorized?: boolean;
}

/**
 * Fetches the PowerGrid API from the server. Returns the full envelope so
 * list callers can read `meta`. Throws ApiError on any non-2xx response.
 */
export async function serverRequest<T>(
  path: string,
  options: ServerRequestOptions = {}
): Promise<ApiSuccess<T>> {
  const {
    method = "GET",
    body,
    query,
    auth = true,
    revalidate,
    redirectOnUnauthorized = true,
  } = options;

  const headers: Record<string, string> = { Accept: "application/json" };

  let token = options.token;
  if (auth && !token) {
    token = (await cookies()).get(ACCESS_COOKIE)?.value;
  }
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body !== undefined) headers["Content-Type"] = "application/json";

  let response: Response;
  try {
    response = await fetch(`${serverConfig.apiBaseUrl}${path}${toQueryString(query)}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      ...(revalidate !== undefined && !token
        ? { next: { revalidate } }
        : { cache: "no-store" as const }),
    });
  } catch {
    throw new ApiError(503, "Could not reach the PowerGrid API. Please try again shortly.");
  }

  const payload: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    if (response.status === 401 && auth && redirectOnUnauthorized) {
      redirect("/api/auth/logout?reason=expired");
    }
    throw ApiError.fromBody(response.status, payload);
  }

  return payload as ApiSuccess<T>;
}

/** GET returning just `data`. */
export async function apiGet<T>(path: string, options?: Omit<ServerRequestOptions, "method" | "body">) {
  const result = await serverRequest<T>(path, options);
  return result.data;
}

/** GET for paginated endpoints, returning `{ data, meta }`. */
export async function apiList<T>(
  path: string,
  options?: Omit<ServerRequestOptions, "method" | "body">
): Promise<Paginated<T>> {
  const result = await serverRequest<T[]>(path, options);
  return {
    data: result.data,
    meta: result.meta ?? { page: 1, limit: result.data.length, total: result.data.length, totalPages: 1 },
  };
}

/**
 * Public data for statically rendered pages. Failure never breaks the build
 * or the page: it returns null and the page renders its unavailable state.
 */
export async function publicGet<T>(path: string, query?: QueryParams, revalidate = 120) {
  try {
    return await serverRequest<T>(path, { auth: false, query, revalidate });
  } catch {
    return null;
  }
}

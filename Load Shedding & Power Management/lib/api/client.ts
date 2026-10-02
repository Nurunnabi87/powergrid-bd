import { ApiError } from "@/lib/api/errors";
import { toQueryString } from "@/lib/api/query-string";
import type { ApiSuccess, Paginated, QueryParams } from "@/types/api";

/**
 * Browser-side API access. Every call goes to this app's /api/proxy route,
 * which attaches the httpOnly session token — the browser never holds it.
 */

const PROXY = "/api/proxy";

export interface ClientRequestOptions {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
  query?: QueryParams;
  signal?: AbortSignal;
}

const redirectToLogin = () => {
  if (typeof window === "undefined") return;
  const next = `${window.location.pathname}${window.location.search}`;
  // A full page load (not router.push) is deliberate: it discards every
  // in-memory cache belonging to the expired session.
  // eslint-disable-next-line @next/next/no-location-assign-relative-destination
  window.location.assign(`/login?reason=expired&next=${encodeURIComponent(next)}`);
};

export async function clientRequest<T>(
  path: string,
  { method = "GET", body, query, signal }: ClientRequestOptions = {}
): Promise<ApiSuccess<T>> {
  let response: Response;
  try {
    response = await fetch(`${PROXY}${path}${toQueryString(query)}`, {
      method,
      signal,
      headers: {
        Accept: "application/json",
        ...(body !== undefined && { "Content-Type": "application/json" }),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") throw error;
    throw new ApiError(0, "You appear to be offline. Check your connection and try again.");
  }

  const payload: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    if (response.status === 401) redirectToLogin();
    throw ApiError.fromBody(response.status, payload);
  }

  return payload as ApiSuccess<T>;
}

export const api = {
  get: async <T>(path: string, query?: QueryParams, signal?: AbortSignal) =>
    (await clientRequest<T>(path, { query, signal })).data,

  list: async <T>(path: string, query?: QueryParams, signal?: AbortSignal): Promise<Paginated<T>> => {
    const result = await clientRequest<T[]>(path, { query, signal });
    return {
      data: result.data,
      meta: result.meta ?? { page: 1, limit: result.data.length, total: result.data.length, totalPages: 1 },
    };
  },

  post: <T>(path: string, body?: unknown) => clientRequest<T>(path, { method: "POST", body: body ?? {} }),
  patch: <T>(path: string, body?: unknown) => clientRequest<T>(path, { method: "PATCH", body: body ?? {} }),
  delete: <T>(path: string) => clientRequest<T>(path, { method: "DELETE" }),
};

/**
 * Multipart upload with progress events. fetch() cannot report upload
 * progress, so this uses XMLHttpRequest.
 */
export function uploadWithProgress<T>(
  path: string,
  formData: FormData,
  { method = "POST", onProgress }: { method?: "POST" | "PATCH"; onProgress?: (percent: number) => void } = {}
): Promise<ApiSuccess<T>> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open(method, `${PROXY}${path}`);
    xhr.setRequestHeader("Accept", "application/json");

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress?.(Math.round((event.loaded / event.total) * 100));
    };

    xhr.onload = () => {
      let payload: unknown = null;
      try {
        payload = JSON.parse(xhr.responseText);
      } catch {
        /* non-JSON error page */
      }
      if (xhr.status >= 200 && xhr.status < 300) {
        onProgress?.(100);
        resolve(payload as ApiSuccess<T>);
        return;
      }
      if (xhr.status === 401) redirectToLogin();
      reject(ApiError.fromBody(xhr.status, payload));
    };

    xhr.onerror = () => reject(new ApiError(0, "Upload failed. Check your connection and try again."));
    xhr.send(formData);
  });
}

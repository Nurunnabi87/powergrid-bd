import { NextResponse, type NextRequest } from "next/server";
import { refreshAccessToken } from "@/lib/auth/refresh";
import {
  ACCESS_COOKIE,
  ACCESS_MAX_AGE,
  REFRESH_COOKIE,
  cookieOptions,
} from "@/lib/auth/tokens";
import { serverConfig } from "@/lib/config";

/**
 * Backend-for-frontend proxy for client components (TanStack Query,
 * mutations, uploads). The browser only ever talks to this origin; the
 * access token stays in an httpOnly cookie and is attached here.
 *
 * On a 401 it refreshes the access token once and replays the request.
 */

// Only these top-level API resources are reachable through the proxy.
const ALLOWED_ROOTS = new Set([
  "users",
  "zones",
  "substations",
  "feeders",
  "areas",
  "connections",
  "schedules",
  "outages",
  "bills",
  "payments",
  "notifications",
  "admin",
  "analytics",
  "public",
]);

const FORWARDED_HEADERS = ["content-type", "accept"];

async function forward(
  request: NextRequest,
  path: string,
  body: ArrayBuffer | undefined,
  token: string | undefined
): Promise<Response> {
  const headers = new Headers();
  for (const name of FORWARDED_HEADERS) {
    const value = request.headers.get(name);
    if (value) headers.set(name, value);
  }
  if (token) headers.set("Authorization", `Bearer ${token}`);

  return fetch(`${serverConfig.apiBaseUrl}/${path}${request.nextUrl.search}`, {
    method: request.method,
    headers,
    body,
    cache: "no-store",
  });
}

async function handle(request: NextRequest, ctx: RouteContext<"/api/proxy/[...path]">) {
  const { path: segments } = await ctx.params;

  if (
    !segments.length ||
    !ALLOWED_ROOTS.has(segments[0]) ||
    segments.some((segment) => segment === ".." || segment === ".")
  ) {
    return NextResponse.json({ success: false, message: "Not found" }, { status: 404 });
  }

  const path = segments.map(encodeURIComponent).join("/");
  // Buffered (uploads are capped at 4 MB) so the request can be replayed
  // after a token refresh.
  const body =
    request.method === "GET" || request.method === "HEAD" ? undefined : await request.arrayBuffer();

  let token = request.cookies.get(ACCESS_COOKIE)?.value;
  let renewed: string | null = null;

  let upstream: Response;
  try {
    upstream = await forward(request, path, body, token);

    if (upstream.status === 401) {
      const refreshToken = request.cookies.get(REFRESH_COOKIE)?.value;
      renewed = refreshToken ? await refreshAccessToken(refreshToken) : null;
      if (renewed) {
        token = renewed;
        upstream = await forward(request, path, body, token);
      }
    }
  } catch {
    return NextResponse.json(
      { success: false, message: "Could not reach the PowerGrid API. Please try again shortly." },
      { status: 503 }
    );
  }

  const response = new NextResponse(upstream.body, {
    status: upstream.status,
    headers: { "content-type": upstream.headers.get("content-type") ?? "application/json" },
  });

  if (renewed) {
    response.cookies.set(ACCESS_COOKIE, renewed, cookieOptions(ACCESS_MAX_AGE));
  } else if (upstream.status === 401) {
    // The session is unrecoverable; the client redirects to /login.
    response.cookies.delete(ACCESS_COOKIE);
    response.cookies.delete(REFRESH_COOKIE);
  }

  return response;
}

export {
  handle as GET,
  handle as POST,
  handle as PATCH,
  handle as PUT,
  handle as DELETE,
};

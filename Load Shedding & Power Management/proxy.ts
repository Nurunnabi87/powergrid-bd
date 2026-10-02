import { NextResponse, type NextRequest } from "next/server";
import { refreshAccessToken } from "@/lib/auth/refresh";
import {
  AUTH_PAGES,
  ROLE_HOME,
  SIGNED_IN_PREFIXES,
  requiredRoleFor,
} from "@/lib/auth/roles";
import {
  ACCESS_COOKIE,
  ACCESS_MAX_AGE,
  REFRESH_COOKIE,
  cookieOptions,
  verifyAccessToken,
} from "@/lib/auth/tokens";

/**
 * Route-level access control (Next.js 16 renamed `middleware` to `proxy`).
 *
 * 1. Verifies the access-token cookie with the API's JWT secret.
 * 2. If it has expired but a refresh token exists, silently obtains a new
 *    access token and forwards it to this render and the browser.
 * 3. Enforces the role that owns each protected prefix; a user on another
 *    role's URL is sent to their own dashboard.
 */
export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  const accessToken = request.cookies.get(ACCESS_COOKIE)?.value;
  const refreshToken = request.cookies.get(REFRESH_COOKIE)?.value;

  let claims = await verifyAccessToken(accessToken);
  let renewedToken: string | null = null;

  if (!claims && refreshToken) {
    renewedToken = await refreshAccessToken(refreshToken);
    if (renewedToken) claims = await verifyAccessToken(renewedToken);
  }

  const requiredRole = requiredRoleFor(pathname);
  const needsSession =
    requiredRole !== null ||
    SIGNED_IN_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));

  // Signed out (or the refresh failed) on a protected page.
  if (needsSession && !claims) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", `${pathname}${search}`);
    const response = NextResponse.redirect(loginUrl);
    if (accessToken || refreshToken) {
      response.cookies.delete(ACCESS_COOKIE);
      response.cookies.delete(REFRESH_COOKIE);
    }
    return response;
  }

  // Signed in, but on another role's area.
  if (claims && requiredRole && claims.role !== requiredRole) {
    return NextResponse.redirect(new URL(ROLE_HOME[claims.role], request.url));
  }

  // Already signed in: skip the login/register pages.
  if (claims && AUTH_PAGES.includes(pathname)) {
    return NextResponse.redirect(new URL(ROLE_HOME[claims.role], request.url));
  }

  if (!renewedToken) return NextResponse.next();

  // Make the renewed token visible to server components in THIS request,
  // then persist it in the browser.
  request.cookies.set(ACCESS_COOKIE, renewedToken);
  const headers = new Headers(request.headers);
  headers.set("cookie", request.cookies.toString());

  const response = NextResponse.next({ request: { headers } });
  response.cookies.set(ACCESS_COOKIE, renewedToken, cookieOptions(ACCESS_MAX_AGE));
  return response;
}

export const config = {
  // Skip API routes, Next internals and static files.
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|icon|opengraph-image|robots.txt|sitemap.xml|.*\\.(?:png|jpg|jpeg|svg|webp|ico)$).*)"],
};

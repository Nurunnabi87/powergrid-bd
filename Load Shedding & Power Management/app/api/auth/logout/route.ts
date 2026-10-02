import { NextResponse, type NextRequest } from "next/server";
import { ACCESS_COOKIE, REFRESH_COOKIE } from "@/lib/auth/tokens";
import { serverConfig } from "@/lib/config";

/**
 * Clears the session cookies and revokes the refresh token, then lands on
 * /login. Server components redirect here when the API reports a 401,
 * because a component render cannot delete cookies itself.
 */
export async function GET(request: NextRequest) {
  const refreshToken = request.cookies.get(REFRESH_COOKIE)?.value;

  if (refreshToken) {
    // Best effort: a failed revoke must not keep the user signed in here.
    await fetch(`${serverConfig.apiBaseUrl}/auth/logout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
      cache: "no-store",
    }).catch(() => undefined);
  }

  const loginUrl = new URL("/login", request.url);
  const reason = request.nextUrl.searchParams.get("reason");
  if (reason === "expired") loginUrl.searchParams.set("reason", "expired");

  const response = NextResponse.redirect(loginUrl);
  response.cookies.delete(ACCESS_COOKIE);
  response.cookies.delete(REFRESH_COOKIE);
  return response;
}

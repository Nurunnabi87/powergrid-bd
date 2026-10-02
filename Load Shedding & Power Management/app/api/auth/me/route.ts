import { NextResponse, type NextRequest } from "next/server";
import { ACCESS_COOKIE, verifyAccessToken } from "@/lib/auth/tokens";

/**
 * Minimal session probe for statically rendered public pages: returns only
 * the role, so the public navbar can offer "Go to dashboard" without making
 * every marketing page dynamic.
 */
export async function GET(request: NextRequest) {
  const claims = await verifyAccessToken(request.cookies.get(ACCESS_COOKIE)?.value);
  return NextResponse.json(
    { authenticated: Boolean(claims), role: claims?.role ?? null },
    { headers: { "Cache-Control": "private, no-store" } }
  );
}

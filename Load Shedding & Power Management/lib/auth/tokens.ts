import { decodeJwt, jwtVerify } from "jose";
import { isRole } from "@/lib/auth/roles";
import type { UserRole } from "@/types/domain";

/**
 * Cookie names and JWT helpers. Deliberately free of `server-only` and
 * next/headers so proxy.ts can import it too.
 */

export const ACCESS_COOKIE = "pg_access";
export const REFRESH_COOKIE = "pg_refresh";

export const ACCESS_MAX_AGE = 60 * 60 * 24; // matches the API's 1d access token
export const REFRESH_MAX_AGE = 60 * 60 * 24 * 30; // matches the API's 30d refresh token

export const cookieOptions = (maxAge: number) => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge,
});

export interface TokenClaims {
  userId: string;
  email: string;
  role: UserRole;
  exp?: number;
}

const toClaims = (payload: Record<string, unknown>): TokenClaims | null => {
  const { userId, email, role, exp } = payload;
  if (typeof userId !== "string" || typeof email !== "string" || !isRole(role)) {
    return null;
  }
  return { userId, email, role, exp: typeof exp === "number" ? exp : undefined };
};

/**
 * Verifies the access token's signature and expiry with the API's secret.
 * Returns null for a missing, forged or expired token.
 */
export const verifyAccessToken = async (token: string | undefined): Promise<TokenClaims | null> => {
  if (!token) return null;
  const secret = process.env.JWT_ACCESS_SECRET;

  try {
    if (!secret) {
      // Without the secret the claims are only read, never trusted for
      // authorisation: the API re-checks the token on every request anyway.
      const decoded = toClaims(decodeJwt(token));
      if (!decoded?.exp || decoded.exp * 1000 <= Date.now()) return null;
      return decoded;
    }
    const { payload } = await jwtVerify(token, new TextEncoder().encode(secret));
    return toClaims(payload);
  } catch {
    return null;
  }
};

import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { apiGet } from "@/lib/api/server";
import { ROLE_HOME } from "@/lib/auth/roles";
import { ACCESS_COOKIE, verifyAccessToken } from "@/lib/auth/tokens";
import type { UserProfile, UserRole } from "@/types/domain";

/**
 * The signed-in user's claims from the verified access cookie. Cheap: no
 * network call, so public layouts can use it to switch nav buttons.
 */
export const getClaims = cache(async () => {
  const token = (await cookies()).get(ACCESS_COOKIE)?.value;
  return verifyAccessToken(token);
});

/**
 * The full profile from GET /users/me, deduplicated per request by
 * React.cache, so a layout and its page share one round trip.
 */
export const getSession = cache(async (): Promise<UserProfile | null> => {
  const claims = await getClaims();
  if (!claims) return null;
  return apiGet<UserProfile>("/users/me");
});

/**
 * Defence in depth behind proxy.ts: a role layout calls this so a page can
 * never render for the wrong role even if the proxy matcher is changed.
 */
export async function requireRole(role: UserRole): Promise<UserProfile> {
  const user = await getSession();
  if (!user) redirect("/login");
  if (user.role !== role) redirect(ROLE_HOME[user.role]);
  return user;
}

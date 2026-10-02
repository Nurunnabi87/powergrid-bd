/**
 * Exchanges a refresh token for a new access token. Used by proxy.ts
 * (before rendering) and by the BFF route handler (on a 401). Returns null
 * when the refresh token is expired, revoked or the API is unreachable.
 */
export async function refreshAccessToken(refreshToken: string): Promise<string | null> {
  const base = (process.env.API_BASE_URL ?? "http://localhost:5000/api/v1").replace(/\/$/, "");

  try {
    const response = await fetch(`${base}/auth/refresh-token`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ refreshToken }),
      cache: "no-store",
    });
    if (!response.ok) return null;
    const body = (await response.json()) as { data?: { accessToken?: string } };
    return body.data?.accessToken ?? null;
  } catch {
    return null;
  }
}

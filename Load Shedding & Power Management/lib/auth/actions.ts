"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { toActionError, type ActionError } from "@/lib/api/errors";
import { serverRequest } from "@/lib/api/server";
import { safeRedirect } from "@/lib/auth/roles";
import {
  ACCESS_COOKIE,
  ACCESS_MAX_AGE,
  REFRESH_COOKIE,
  REFRESH_MAX_AGE,
  cookieOptions,
} from "@/lib/auth/tokens";
import { demoAccounts } from "@/lib/config";
import {
  changePasswordSchema,
  loginSchema,
  registerSchema,
  type ChangePasswordValues,
  type LoginValues,
  type RegisterValues,
} from "@/lib/validations/auth";
import type { AuthResult, UserRole } from "@/types/domain";

/**
 * Authentication runs as server actions: the API's tokens are written to
 * httpOnly cookies here and never reach client JavaScript.
 */

const invalid = (message: string): ActionError => ({
  ok: false,
  status: 400,
  message,
  fieldErrors: [],
});

async function startSession({ accessToken, refreshToken }: AuthResult) {
  const store = await cookies();
  store.set(ACCESS_COOKIE, accessToken, cookieOptions(ACCESS_MAX_AGE));
  store.set(REFRESH_COOKIE, refreshToken, cookieOptions(REFRESH_MAX_AGE));
}

async function authenticate(email: string, password: string) {
  const result = await serverRequest<AuthResult>("/auth/login", {
    method: "POST",
    body: { email, password },
    auth: false,
    redirectOnUnauthorized: false,
  });
  await startSession(result.data);
  return result.data.user;
}

export async function loginAction(
  values: LoginValues,
  next?: string | null
): Promise<ActionError> {
  const parsed = loginSchema.safeParse(values);
  if (!parsed.success) return invalid("Please check the highlighted fields");

  let destination: string;
  try {
    const user = await authenticate(parsed.data.email, parsed.data.password);
    destination = safeRedirect(next, user.role);
  } catch (error) {
    return toActionError(error);
  }
  // redirect() throws, so it must run outside the try/catch.
  redirect(destination);
}

/** One-click login for evaluators. Credentials live in server env only. */
export async function demoLoginAction(role: UserRole): Promise<ActionError> {
  const account = demoAccounts[role];
  if (!account) return invalid("Unknown demo role");

  let destination: string;
  try {
    const user = await authenticate(account.email, account.password);
    destination = safeRedirect(null, user.role);
  } catch (error) {
    return toActionError(error);
  }
  redirect(destination);
}

export async function registerAction(values: RegisterValues): Promise<ActionError> {
  const parsed = registerSchema.safeParse(values);
  if (!parsed.success) return invalid("Please check the highlighted fields");

  const { name, email, password, phone, address } = parsed.data;

  try {
    const result = await serverRequest<AuthResult>("/auth/register", {
      method: "POST",
      auth: false,
      redirectOnUnauthorized: false,
      body: {
        name,
        email,
        password,
        ...(phone ? { phone } : {}),
        ...(address ? { address } : {}),
      },
    });
    await startSession(result.data);
  } catch (error) {
    return toActionError(error);
  }
  redirect("/dashboard?welcome=1");
}

async function clearSession() {
  const store = await cookies();
  const refreshToken = store.get(REFRESH_COOKIE)?.value;

  if (refreshToken) {
    await serverRequest("/auth/logout", {
      method: "POST",
      auth: false,
      redirectOnUnauthorized: false,
      body: { refreshToken },
    }).catch(() => undefined);
  }

  store.delete(ACCESS_COOKIE);
  store.delete(REFRESH_COOKIE);
}

export async function logoutAction(): Promise<void> {
  await clearSession();
  redirect("/login");
}

/**
 * The API revokes every refresh token on a password change, so the user is
 * signed out here and asked to log in with the new password.
 */
export async function changePasswordAction(
  values: ChangePasswordValues
): Promise<ActionError> {
  const parsed = changePasswordSchema.safeParse(values);
  if (!parsed.success) return invalid("Please check the highlighted fields");

  try {
    await serverRequest("/auth/change-password", {
      method: "POST",
      redirectOnUnauthorized: false,
      body: { oldPassword: parsed.data.oldPassword, newPassword: parsed.data.newPassword },
    });
  } catch (error) {
    return toActionError(error);
  }

  await clearSession();
  redirect("/login?reason=password-changed");
}

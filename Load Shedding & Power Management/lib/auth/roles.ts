import type { UserRole } from "@/types/domain";

/**
 * Role → route rules shared by proxy.ts (route level) and the UI (nav,
 * redirects). Kept free of server-only imports so both can use it.
 */

export const ROLE_HOME: Record<UserRole, string> = {
  ADMIN: "/admin",
  TECHNICIAN: "/technician",
  CUSTOMER: "/dashboard",
};

export const ROLE_LABEL: Record<UserRole, string> = {
  ADMIN: "Admin",
  TECHNICIAN: "Technician",
  CUSTOMER: "Customer",
};

/** Protected path prefixes and the single role allowed in each. */
export const PROTECTED_PREFIXES: { prefix: string; role: UserRole }[] = [
  { prefix: "/admin", role: "ADMIN" },
  { prefix: "/technician", role: "TECHNICIAN" },
  { prefix: "/dashboard", role: "CUSTOMER" },
];

/** Pages that require a signed-in user of any role. */
export const SIGNED_IN_PREFIXES = ["/payment"];

export const AUTH_PAGES = ["/login", "/register"];

export const requiredRoleFor = (pathname: string): UserRole | null => {
  const match = PROTECTED_PREFIXES.find(
    ({ prefix }) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
  return match?.role ?? null;
};

export const isRole = (value: unknown): value is UserRole =>
  value === "ADMIN" || value === "TECHNICIAN" || value === "CUSTOMER";

/** Only same-site relative paths are honoured as post-login redirects. */
export const safeRedirect = (target: string | null | undefined, role: UserRole): string => {
  if (target && target.startsWith("/") && !target.startsWith("//")) {
    const required = requiredRoleFor(target);
    if (!required || required === role) return target;
  }
  return ROLE_HOME[role];
};

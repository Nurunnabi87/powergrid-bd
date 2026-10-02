"use client";

import { useSessionStore } from "@/stores/session-store";
import type { UserRole } from "@/types/domain";

/** The signed-in user plus role helpers for conditional UI. */
export function useSession() {
  const user = useSessionStore((state) => state.user);

  return {
    user,
    role: user?.role ?? null,
    hasRole: (...roles: UserRole[]) => (user ? roles.includes(user.role) : false),
  };
}

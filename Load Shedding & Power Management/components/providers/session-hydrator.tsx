"use client";

import { useEffect, type ReactNode } from "react";
import { useSessionStore } from "@/stores/session-store";
import type { UserProfile } from "@/types/domain";

/**
 * Seeds the Zustand session store with the user the server already loaded,
 * so client components (header menu, role gates) can read it synchronously.
 */
export function SessionHydrator({ user, children }: { user: UserProfile; children: ReactNode }) {
  // Set during render on first mount so children never see a null user.
  if (useSessionStore.getState().user?.id !== user.id) {
    useSessionStore.setState({ user });
  }

  useEffect(() => {
    useSessionStore.setState({ user });
  }, [user]);

  return children;
}

import { create } from "zustand";
import type { UserProfile } from "@/types/domain";

/**
 * The signed-in user, available to any client component without prop
 * drilling. Hydrated from the server-rendered session by <SessionHydrator>;
 * the server remains the source of truth for authorisation.
 */
interface SessionState {
  user: UserProfile | null;
  setUser: (user: UserProfile | null) => void;
  patchUser: (patch: Partial<UserProfile>) => void;
}

export const useSessionStore = create<SessionState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  patchUser: (patch) => set((state) => (state.user ? { user: { ...state.user, ...patch } } : state)),
}));

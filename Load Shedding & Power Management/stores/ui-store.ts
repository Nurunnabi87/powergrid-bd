import { create } from "zustand";
import { persist } from "zustand/middleware";

/** Purely presentational UI state for the dashboard shell. */
interface UiState {
  /** Desktop sidebar collapsed to icons (remembered per browser). */
  sidebarCollapsed: boolean;
  /** Mobile navigation drawer. */
  mobileNavOpen: boolean;
  toggleSidebar: () => void;
  setMobileNavOpen: (open: boolean) => void;
}

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      mobileNavOpen: false,
      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      setMobileNavOpen: (open) => set({ mobileNavOpen: open }),
    }),
    {
      name: "powergrid-ui",
      // Only the collapse preference is worth remembering.
      partialize: (state) => ({ sidebarCollapsed: state.sidebarCollapsed }),
    }
  )
);

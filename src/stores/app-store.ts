import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AppState {
  // Theme
  theme: "light" | "dark" | "system";
  setTheme: (theme: "light" | "dark" | "system") => void;

  // Organization context
  currentOrganizationId: string | null;
  setCurrentOrganizationId: (id: string | null) => void;

  // Global search
  isSearchOpen: boolean;
  setSearchOpen: (open: boolean) => void;
  toggleSearch: () => void;

  // Command palette
  isCommandPaletteOpen: boolean;
  setCommandPaletteOpen: (open: boolean) => void;
  toggleCommandPalette: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // Theme
      theme: "dark",
      setTheme: (theme) => set({ theme }),

      // Organization
      currentOrganizationId: null,
      setCurrentOrganizationId: (id) => set({ currentOrganizationId: id }),

      // Search
      isSearchOpen: false,
      setSearchOpen: (open) => set({ isSearchOpen: open }),
      toggleSearch: () =>
        set((state) => ({ isSearchOpen: !state.isSearchOpen })),

      // Command Palette
      isCommandPaletteOpen: false,
      setCommandPaletteOpen: (open) => set({ isCommandPaletteOpen: open }),
      toggleCommandPalette: () =>
        set((state) => ({
          isCommandPaletteOpen: !state.isCommandPaletteOpen,
        })),
    }),
    {
      name: "cortex-app-store",
      partialize: (state) => ({
        theme: state.theme,
        currentOrganizationId: state.currentOrganizationId,
      }),
    }
  )
);

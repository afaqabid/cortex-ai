import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SidebarState {
  isCollapsed: boolean;
  isMobileOpen: boolean;
  activeSection: string | null;
  expandedItems: string[];

  setCollapsed: (collapsed: boolean) => void;
  toggleCollapsed: () => void;
  setMobileOpen: (open: boolean) => void;
  toggleMobileOpen: () => void;
  setActiveSection: (section: string | null) => void;
  toggleExpandedItem: (item: string) => void;
}

export const useSidebarStore = create<SidebarState>()(
  persist(
    (set) => ({
      isCollapsed: false,
      isMobileOpen: false,
      activeSection: null,
      expandedItems: ["CRM"],

      setCollapsed: (collapsed) => set({ isCollapsed: collapsed }),
      toggleCollapsed: () =>
        set((state) => ({ isCollapsed: !state.isCollapsed })),
      setMobileOpen: (open) => set({ isMobileOpen: open }),
      toggleMobileOpen: () =>
        set((state) => ({ isMobileOpen: !state.isMobileOpen })),
      setActiveSection: (section) => set({ activeSection: section }),
      toggleExpandedItem: (item) =>
        set((state) => ({
          expandedItems: state.expandedItems.includes(item)
            ? state.expandedItems.filter((i) => i !== item)
            : [...state.expandedItems, item],
        })),
    }),
    {
      name: "cortex-sidebar-store",
      partialize: (state) => ({
        isCollapsed: state.isCollapsed,
        expandedItems: state.expandedItems,
      }),
    }
  )
);

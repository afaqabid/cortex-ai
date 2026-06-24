"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Bell,
  Menu,
  Moon,
  Sun,
  ChevronRight,
} from "lucide-react";
import { useSidebarStore } from "@/stores/sidebar-store";
import { useAppStore } from "@/stores/app-store";
import { useNotificationStore } from "@/stores/notification-store";
import { cn } from "@/lib/utils";

const breadcrumbMap: Record<string, string> = {
  dashboard: "Dashboard",
  crm: "CRM",
  leads: "Leads",
  contacts: "Contacts",
  companies: "Companies",
  pipelines: "Pipelines",
  projects: "Projects",
  tasks: "Tasks",
  invoices: "Invoices",
  knowledge: "Knowledge",
  files: "Files",
  team: "Team",
  analytics: "Analytics",
  "ai-assistant": "AI Assistant",
  settings: "Settings",
  organization: "Organization",
  members: "Members",
  roles: "Roles",
};

export function Topbar() {
  const pathname = usePathname();
  const { toggleMobileOpen } = useSidebarStore();
  const { theme, setTheme, toggleCommandPalette } = useAppStore();
  const { unreadCount, togglePanel } = useNotificationStore();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  // Build breadcrumbs
  const segments = pathname.split("/").filter(Boolean);
  const breadcrumbs = segments.map((segment, index) => ({
    label: breadcrumbMap[segment] || segment,
    href: "/" + segments.slice(0, index + 1).join("/"),
    isLast: index === segments.length - 1,
  }));

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-background/80 backdrop-blur-md px-4 lg:px-6">
      {/* Left — Mobile menu + Breadcrumbs */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleMobileOpen}
          className="flex lg:hidden h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
        >
          <Menu className="h-5 w-5" />
        </button>

        <nav className="hidden sm:flex items-center gap-1 text-sm">
          {breadcrumbs.map((crumb, i) => (
            <div key={crumb.href} className="flex items-center gap-1">
              {i > 0 && (
                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50" />
              )}
              <span
                className={cn(
                  "transition-colors",
                  crumb.isLast
                    ? "text-foreground font-medium"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {crumb.label}
              </span>
            </div>
          ))}
        </nav>
      </div>

      {/* Right — Search, Theme, Notifications, User */}
      <div className="flex items-center gap-1.5">
        {/* Search button */}
        <button
          onClick={toggleCommandPalette}
          className="flex h-8 items-center gap-2 rounded-lg border border-border bg-muted/50 px-3 text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
        >
          <Search className="h-3.5 w-3.5" />
          <span className="hidden md:inline">Search...</span>
          <kbd className="hidden md:inline-flex h-5 items-center gap-0.5 rounded border border-border bg-background px-1.5 text-[10px] font-medium text-muted-foreground">
            ⌘K
          </kbd>
        </button>

        {/* Theme toggle */}
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
        >
          {theme === "dark" ? (
            <Sun className="h-4 w-4" />
          ) : (
            <Moon className="h-4 w-4" />
          )}
        </button>

        {/* Notifications */}
        <button
          onClick={togglePanel}
          className="relative flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-500 px-1 text-[10px] font-bold text-white"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </motion.span>
          )}
        </button>

        {/* User menu */}
        <div className="relative">
          <button
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-500/10 text-brand-500 hover:bg-brand-500/20 transition-colors"
          >
            <span className="text-xs font-bold">CA</span>
          </button>

          <AnimatePresence>
            {isUserMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsUserMenuOpen(false)}
                />
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-border bg-popover p-1.5 shadow-lg z-50"
                >
                  <div className="px-3 py-2 border-b border-border mb-1">
                    <p className="text-sm font-medium">Demo User</p>
                    <p className="text-xs text-muted-foreground">
                      demo@cortexai.com
                    </p>
                  </div>
                  <a
                    href="/settings"
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                  >
                    Settings
                  </a>
                  <button
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-sm text-red-500 hover:bg-red-500/10 transition-colors"
                    onClick={() => {
                      setIsUserMenuOpen(false);
                    }}
                  >
                    Sign out
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}

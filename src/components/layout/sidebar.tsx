"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { SignOutConfirmModal } from "@/components/shared/sign-out-modal";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  UserPlus,
  Contact,
  Building2,
  GitBranch,
  FolderKanban,
  CheckSquare,
  Receipt,
  BookOpen,
  FileText,
  UsersRound,
  BarChart3,
  Sparkles,
  Settings,
  ChevronDown,
  ChevronLeft,
  PanelLeftClose,
  PanelLeft,
  LogOut,
} from "lucide-react";
import { useSidebarStore } from "@/stores/sidebar-store";
import { signOut } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard,
  Users,
  UserPlus,
  Contact,
  Building2,
  GitBranch,
  FolderKanban,
  CheckSquare,
  Receipt,
  BookOpen,
  FileText,
  UsersRound,
  BarChart3,
  Sparkles,
  Settings,
};

interface NavItem {
  label: string;
  href?: string;
  icon: string;
  children?: { label: string; href: string; icon: string }[];
}

const navSections: { title: string; items: NavItem[] }[] = [
  {
    title: "Overview",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: "LayoutDashboard" },
    ],
  },
  {
    title: "Business",
    items: [
      {
        label: "CRM",
        icon: "Users",
        children: [
          { label: "Leads", href: "/crm/leads", icon: "UserPlus" },
          { label: "Contacts", href: "/crm/contacts", icon: "Contact" },
          { label: "Companies", href: "/crm/companies", icon: "Building2" },
          { label: "Pipelines", href: "/crm/pipelines", icon: "GitBranch" },
        ],
      },
      { label: "Projects", href: "/projects", icon: "FolderKanban" },
      { label: "Tasks", href: "/tasks", icon: "CheckSquare" },
      { label: "Invoices", href: "/invoices", icon: "Receipt" },
    ],
  },
  {
    title: "Workspace",
    items: [
      { label: "Knowledge", href: "/knowledge", icon: "BookOpen" },
      { label: "Files", href: "/files", icon: "FileText" },
      { label: "Team", href: "/team", icon: "UsersRound" },
    ],
  },
  {
    title: "Intelligence",
    items: [
      { label: "Analytics", href: "/analytics", icon: "BarChart3" },
      { label: "AI Assistant", href: "/ai-assistant", icon: "Sparkles" },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isSignOutOpen, setIsSignOutOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOutConfirm = async () => {
    setIsSigningOut(true);
    try {
      await signOut();
      router.push("/login");
    } catch (error) {
      console.error("Sign out failed:", error);
    } finally {
      setIsSigningOut(false);
      setIsSignOutOpen(false);
    }
  };

  const {
    isCollapsed,
    toggleCollapsed,
    isMobileOpen,
    setMobileOpen,
    expandedItems,
    toggleExpandedItem,
  } = useSidebarStore();

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{
          width: isCollapsed ? 72 : 260,
        }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
        className={cn(
          "fixed left-0 top-0 z-50 flex h-screen flex-col border-r border-sidebar-border bg-sidebar-background",
          "lg:relative lg:z-auto",
          isMobileOpen
            ? "translate-x-0"
            : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Logo */}
        <div className="flex h-14 items-center justify-between px-4 border-b border-sidebar-border">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-500 shadow-md shadow-brand-500/25">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <AnimatePresence>
              {!isCollapsed && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  className="text-lg font-bold text-sidebar-foreground overflow-hidden whitespace-nowrap"
                >
                  Cortex AI
                </motion.span>
              )}
            </AnimatePresence>
          </Link>
          <button
            onClick={toggleCollapsed}
            className="hidden lg:flex h-7 w-7 items-center justify-center rounded-md text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
          >
            {isCollapsed ? (
              <PanelLeft className="h-4 w-4" />
            ) : (
              <PanelLeftClose className="h-4 w-4" />
            )}
          </button>
          <button
            onClick={() => setMobileOpen(false)}
            className="flex lg:hidden h-7 w-7 items-center justify-center rounded-md text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-3 px-3 no-scrollbar">
          {navSections.map((section) => (
            <div key={section.title} className="mb-4">
              {!isCollapsed && (
                <div className="px-2 mb-1.5">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-sidebar-foreground/40">
                    {section.title}
                  </span>
                </div>
              )}
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const Icon = iconMap[item.icon];
                  const hasChildren = !!item.children;
                  const isExpanded = expandedItems.includes(item.label);
                  const active = item.href
                    ? isActive(item.href)
                    : item.children?.some((child) => isActive(child.href));

                  if (hasChildren) {
                    return (
                      <div key={item.label}>
                        <button
                          onClick={() => toggleExpandedItem(item.label)}
                          className={cn(
                            "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium transition-all",
                            active
                              ? "text-sidebar-primary"
                              : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
                          )}
                          title={isCollapsed ? item.label : undefined}
                        >
                          {Icon && (
                            <Icon
                              className={cn(
                                "h-4 w-4 shrink-0",
                                active && "text-sidebar-primary"
                              )}
                            />
                          )}
                          {!isCollapsed && (
                            <>
                              <span className="flex-1 text-left">
                                {item.label}
                              </span>
                              <ChevronDown
                                className={cn(
                                  "h-3.5 w-3.5 transition-transform duration-200",
                                  isExpanded && "rotate-180"
                                )}
                              />
                            </>
                          )}
                        </button>
                        <AnimatePresence>
                          {(isExpanded || isCollapsed) && !isCollapsed && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden"
                            >
                              <div className="ml-4 mt-0.5 space-y-0.5 border-l border-sidebar-border pl-3">
                                {item.children?.map((child) => {
                                  const ChildIcon = iconMap[child.icon];
                                  const childActive = isActive(child.href);
                                  return (
                                    <Link
                                      key={child.href}
                                      href={child.href}
                                      onClick={() => setMobileOpen(false)}
                                      className={cn(
                                        "flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-sm transition-all",
                                        childActive
                                          ? "text-sidebar-primary bg-sidebar-accent font-medium"
                                          : "text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent"
                                      )}
                                    >
                                      {ChildIcon && (
                                        <ChildIcon className="h-3.5 w-3.5 shrink-0" />
                                      )}
                                      <span>{child.label}</span>
                                    </Link>
                                  );
                                })}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  }

                  return (
                    <Link
                      key={item.href}
                      href={item.href!}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        "relative flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium transition-all",
                        active
                          ? "text-sidebar-primary bg-sidebar-accent"
                          : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
                      )}
                      title={isCollapsed ? item.label : undefined}
                    >
                      {active && (
                        <motion.div
                          layoutId="activeNav"
                          className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full bg-sidebar-primary"
                          transition={{
                            type: "spring",
                            stiffness: 380,
                            damping: 30,
                          }}
                        />
                      )}
                      {Icon && (
                        <Icon
                          className={cn(
                            "h-4 w-4 shrink-0",
                            active && "text-sidebar-primary"
                          )}
                        />
                      )}
                      {!isCollapsed && <span>{item.label}</span>}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="border-t border-sidebar-border p-3">
          <Link
            href="/settings"
            className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
            title={isCollapsed ? "Settings" : undefined}
          >
            <Settings className="h-4 w-4 shrink-0" />
            {!isCollapsed && <span>Settings</span>}
          </Link>
          <button
            onClick={() => setIsSignOutOpen(true)}
            className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-sidebar-foreground/70 hover:text-red-500 hover:bg-red-500/10 transition-colors"
            title={isCollapsed ? "Sign out" : undefined}
          >
            <LogOut className="h-4 w-4 shrink-0" />
            {!isCollapsed && <span>Sign out</span>}
          </button>
        </div>
      </motion.aside>

      <SignOutConfirmModal
        isOpen={isSignOutOpen}
        onClose={() => setIsSignOutOpen(false)}
        onConfirm={handleSignOutConfirm}
        isProcessing={isSigningOut}
      />
    </>
  );
}

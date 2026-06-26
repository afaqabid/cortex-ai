"use client";

import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { useAppStore } from "@/stores/app-store";
import { useRouter } from "next/navigation";
import {
  Search,
  FolderKanban,
  Users,
  Receipt,
  BookOpen,
  X,
  Loader2,
  Sparkles,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type NavigableItem = {
  id: string;
  label: string;
  sublabel?: string;
  path: string;
  icon: React.ReactNode;
};

export function CommandPalette() {
  const { isCommandPaletteOpen, setCommandPaletteOpen } = useAppStore();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<{
    leads: any[];
    projects: any[];
    invoices: any[];
    documents: any[];
  }>({ leads: [], projects: [], invoices: [], documents: [] });
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Build a flat list of navigable items from either quick commands or search results
  const items: NavigableItem[] = useMemo(() => {
    if (query.trim() === "") {
      return [
        { id: "qc-dashboard", label: "Go to Dashboard Overview", path: "/dashboard", icon: <Sparkles className="h-4 w-4 text-indigo-500" /> },
        { id: "qc-leads", label: "Go to CRM Sales Leads", path: "/crm/leads", icon: <Users className="h-4 w-4 text-blue-500" /> },
        { id: "qc-projects", label: "Go to Projects Workspace", path: "/projects", icon: <FolderKanban className="h-4 w-4 text-amber-500" /> },
        { id: "qc-invoices", label: "Go to Invoicing Ledger", path: "/invoices", icon: <Receipt className="h-4 w-4 text-emerald-500" /> },
        { id: "qc-knowledge", label: "Go to Knowledge Base Docs", path: "/knowledge", icon: <BookOpen className="h-4 w-4 text-purple-500" /> },
      ];
    }

    const flat: NavigableItem[] = [];
    results.leads.forEach((lead) =>
      flat.push({ id: `lead-${lead.id}`, label: lead.name, sublabel: lead.company ? `(${lead.company})` : undefined, path: `/crm/leads/${lead.id}`, icon: <Users className="h-3.5 w-3.5 text-blue-500 shrink-0" /> })
    );
    results.projects.forEach((project) =>
      flat.push({ id: `project-${project.id}`, label: project.name, path: `/projects/${project.id}`, icon: <FolderKanban className="h-3.5 w-3.5 text-amber-500 shrink-0" /> })
    );
    results.invoices.forEach((invoice) =>
      flat.push({ id: `invoice-${invoice.id}`, label: invoice.number, sublabel: `$${invoice.total}`, path: `/invoices/${invoice.id}`, icon: <Receipt className="h-3.5 w-3.5 text-emerald-500 shrink-0" /> })
    );
    results.documents.forEach((doc) =>
      flat.push({ id: `doc-${doc.id}`, label: doc.title, path: `/knowledge/${doc.id}`, icon: <BookOpen className="h-3.5 w-3.5 text-purple-500 shrink-0" /> })
    );
    return flat;
  }, [query, results]);

  // Reset selected index when items change
  useEffect(() => {
    setSelectedIndex(0);
  }, [items.length, query]);

  // Auto-scroll the selected item into view
  useEffect(() => {
    if (!resultsRef.current) return;
    const buttons = resultsRef.current.querySelectorAll("[data-cmd-item]");
    const target = buttons[selectedIndex] as HTMLElement | undefined;
    target?.scrollIntoView({ block: "nearest" });
  }, [selectedIndex]);

  const handleNavigate = useCallback(
    (path: string) => {
      router.push(path);
      setCommandPaletteOpen(false);
    },
    [router, setCommandPaletteOpen]
  );

  // Keyboard shortcut listener (Ctrl/Cmd+K, Escape, Arrow keys, Enter)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCommandPaletteOpen(!isCommandPaletteOpen);
        return;
      }
      if (e.key === "Escape") {
        setCommandPaletteOpen(false);
        return;
      }

      // Arrow / Enter navigation only when palette is open
      if (!isCommandPaletteOpen) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % (items.length || 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + (items.length || 1)) % (items.length || 1));
      } else if (e.key === "Enter") {
        e.preventDefault();
        const item = items[selectedIndex];
        if (item) handleNavigate(item.path);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isCommandPaletteOpen, setCommandPaletteOpen, items, selectedIndex, handleNavigate]);

  // Focus input when opened
  useEffect(() => {
    if (isCommandPaletteOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery("");
      setResults({ leads: [], projects: [], invoices: [], documents: [] });
      setSelectedIndex(0);
    }
  }, [isCommandPaletteOpen]);

  // Handle Search Input API requests
  useEffect(() => {
    if (!query.trim()) {
      setResults({ leads: [], projects: [], invoices: [], documents: [] });
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/v1/search?q=${encodeURIComponent(query)}`);
        if (res.ok) {
          const data = await res.json();
          setResults(data);
        }
      } catch (err) {
        console.error("Search fetch failed", err);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const hasResults =
    results.leads.length > 0 ||
    results.projects.length > 0 ||
    results.invoices.length > 0 ||
    results.documents.length > 0;

  // Helper to determine category group header index for search results
  const getCategoryLabel = (item: NavigableItem) => {
    if (item.id.startsWith("lead-")) return "CRM Leads";
    if (item.id.startsWith("project-")) return "Projects";
    if (item.id.startsWith("invoice-")) return "Invoices";
    if (item.id.startsWith("doc-")) return "Knowledge Guides";
    return null;
  };

  // Render a single navigable item button
  const renderItem = (item: NavigableItem, flatIndex: number) => {
    const isSelected = flatIndex === selectedIndex;
    const isQuickCommand = item.id.startsWith("qc-");

    return (
      <button
        key={item.id}
        data-cmd-item
        onClick={() => handleNavigate(item.path)}
        onMouseEnter={() => setSelectedIndex(flatIndex)}
        className={`flex items-center gap-${isQuickCommand ? "3" : "2.5"} w-full rounded-lg px-3 py-2 text-xs ${
          isQuickCommand ? "font-semibold" : ""
        } text-slate-800 dark:text-slate-200 text-left cursor-pointer transition-colors ${
          isSelected
            ? "bg-primary/10 ring-1 ring-primary/20"
            : "hover:bg-muted"
        }`}
      >
        {item.icon}
        <span className="font-semibold truncate">{item.label}</span>
        {item.sublabel && (
          <span className={`text-muted-foreground ${item.id.startsWith("invoice-") ? "ml-auto" : ""}`}>
            {item.sublabel}
          </span>
        )}
      </button>
    );
  };

  return (
    <AnimatePresence>
      {isCommandPaletteOpen && (
        <>
          {/* Overlay background */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm"
            onClick={() => setCommandPaletteOpen(false)}
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: -20 }}
            transition={{ duration: 0.15 }}
            className="fixed left-1/2 top-[15%] z-50 w-full max-w-lg -translate-x-1/2 rounded-xl border border-border bg-card shadow-2xl overflow-hidden"
          >
            {/* Input bar */}
            <div className="flex items-center gap-3 border-b border-border px-4 py-3">
              <Search className="h-4.5 w-4.5 text-muted-foreground shrink-0" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Search leads, projects, invoices, or guides..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-1 bg-transparent text-sm focus:outline-none text-slate-900 dark:text-white"
              />
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              ) : (
                <button
                  onClick={() => setCommandPaletteOpen(false)}
                  className="rounded p-1 hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Results Pane */}
            <div ref={resultsRef} className="max-h-[300px] overflow-y-auto p-2 space-y-3">
              {query.trim() === "" ? (
                /* Default quick links view */
                <div>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-2 block mb-1">
                    Quick Commands
                  </span>
                  <div className="space-y-0.5">
                    {items.map((item, i) => renderItem(item, i))}
                  </div>
                </div>
              ) : !isLoading && !hasResults ? (
                /* No matching queries state */
                <div className="py-6 text-center text-xs text-muted-foreground">
                  No matching files or database items found.
                </div>
              ) : (
                /* Dynamic queries returned — grouped by category */
                <div className="space-y-3">
                  {(() => {
                    let globalIndex = 0;
                    let lastCategory: string | null = null;
                    const elements: React.ReactNode[] = [];

                    items.forEach((item) => {
                      const category = getCategoryLabel(item);
                      if (category && category !== lastCategory) {
                        lastCategory = category;
                        elements.push(
                          <span key={`header-${category}`} className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-2 block mb-1 mt-2 first:mt-0">
                            {category}
                          </span>
                        );
                      }
                      elements.push(renderItem(item, globalIndex));
                      globalIndex++;
                    });

                    return elements;
                  })()}
                </div>
              )}
            </div>

            {/* Footer tips */}
            <div className="bg-muted/40 px-4 py-2 border-t border-border flex items-center justify-between text-[10px] text-muted-foreground select-none">
              <span>↑↓ to navigate · Enter to select · Esc to close</span>
              <span>Ctrl + K or ⌘K</span>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

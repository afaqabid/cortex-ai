"use client";

import { useEffect, useState, useRef } from "react";
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

  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCommandPaletteOpen(!isCommandPaletteOpen);
      } else if (e.key === "Escape") {
        setCommandPaletteOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isCommandPaletteOpen, setCommandPaletteOpen]);

  // Focus input when opened
  useEffect(() => {
    if (isCommandPaletteOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery("");
      setResults({ leads: [], projects: [], invoices: [], documents: [] });
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

  const handleNavigate = (path: string) => {
    router.push(path);
    setCommandPaletteOpen(false);
  };

  const hasResults =
    results.leads.length > 0 ||
    results.projects.length > 0 ||
    results.invoices.length > 0 ||
    results.documents.length > 0;

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
            <div className="max-h-[300px] overflow-y-auto p-2 space-y-3">
              {query.trim() === "" ? (
                /* Default quick links view */
                <div>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-2 block mb-1">
                    Quick Commands
                  </span>
                  <div className="space-y-0.5">
                    <button
                      onClick={() => handleNavigate("/dashboard")}
                      className="flex items-center gap-3 w-full rounded-lg px-3 py-2 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-muted text-left cursor-pointer"
                    >
                      <Sparkles className="h-4 w-4 text-indigo-500" />
                      Go to Dashboard Overview
                    </button>
                    <button
                      onClick={() => handleNavigate("/crm/leads")}
                      className="flex items-center gap-3 w-full rounded-lg px-3 py-2 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-muted text-left cursor-pointer"
                    >
                      <Users className="h-4 w-4 text-blue-500" />
                      Go to CRM Sales Leads
                    </button>
                    <button
                      onClick={() => handleNavigate("/projects")}
                      className="flex items-center gap-3 w-full rounded-lg px-3 py-2 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-muted text-left cursor-pointer"
                    >
                      <FolderKanban className="h-4 w-4 text-amber-500" />
                      Go to Projects Workspace
                    </button>
                    <button
                      onClick={() => handleNavigate("/invoices")}
                      className="flex items-center gap-3 w-full rounded-lg px-3 py-2 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-muted text-left cursor-pointer"
                    >
                      <Receipt className="h-4 w-4 text-emerald-500" />
                      Go to Invoicing Ledger
                    </button>
                    <button
                      onClick={() => handleNavigate("/knowledge")}
                      className="flex items-center gap-3 w-full rounded-lg px-3 py-2 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-muted text-left cursor-pointer"
                    >
                      <BookOpen className="h-4 w-4 text-purple-500" />
                      Go to Knowledge Base Docs
                    </button>
                  </div>
                </div>
              ) : !isLoading && !hasResults ? (
                /* No matching queries state */
                <div className="py-6 text-center text-xs text-muted-foreground">
                  No matching files or database items found.
                </div>
              ) : (
                /* Dynamic queries returned */
                <div className="space-y-3">
                  {/* Leads */}
                  {results.leads.length > 0 && (
                    <div>
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-2 block mb-1">
                        CRM Leads
                      </span>
                      {results.leads.map((lead) => (
                        <button
                          key={lead.id}
                          onClick={() => handleNavigate(`/crm/leads/${lead.id}`)}
                          className="flex items-center gap-2.5 w-full rounded-lg px-3 py-2 text-xs hover:bg-muted text-left text-slate-800 dark:text-slate-200 cursor-pointer"
                        >
                          <Users className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                          <span className="font-semibold truncate">{lead.name}</span>
                          {lead.company && <span className="text-muted-foreground">({lead.company})</span>}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Projects */}
                  {results.projects.length > 0 && (
                    <div>
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-2 block mb-1">
                        Projects
                      </span>
                      {results.projects.map((project) => (
                        <button
                          key={project.id}
                          onClick={() => handleNavigate(`/projects/${project.id}`)}
                          className="flex items-center gap-2.5 w-full rounded-lg px-3 py-2 text-xs hover:bg-muted text-left text-slate-800 dark:text-slate-200 cursor-pointer"
                        >
                          <FolderKanban className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                          <span className="font-semibold truncate">{project.name}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Invoices */}
                  {results.invoices.length > 0 && (
                    <div>
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-2 block mb-1">
                        Invoices
                      </span>
                      {results.invoices.map((invoice) => (
                        <button
                          key={invoice.id}
                          onClick={() => handleNavigate(`/invoices/${invoice.id}`)}
                          className="flex items-center gap-2.5 w-full rounded-lg px-3 py-2 text-xs hover:bg-muted text-left text-slate-800 dark:text-slate-200 cursor-pointer"
                        >
                          <Receipt className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                          <span className="font-semibold truncate">{invoice.number}</span>
                          <span className="text-muted-foreground ml-auto">${invoice.total}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Knowledge docs */}
                  {results.documents.length > 0 && (
                    <div>
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-2 block mb-1">
                        Knowledge Guides
                      </span>
                      {results.documents.map((doc) => (
                        <button
                          key={doc.id}
                          onClick={() => handleNavigate(`/knowledge/${doc.id}`)}
                          className="flex items-center gap-2.5 w-full rounded-lg px-3 py-2 text-xs hover:bg-muted text-left text-slate-800 dark:text-slate-200 cursor-pointer"
                        >
                          <BookOpen className="h-3.5 w-3.5 text-purple-500 shrink-0" />
                          <span className="font-semibold truncate">{doc.title}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer tips */}
            <div className="bg-muted/40 px-4 py-2 border-t border-border flex items-center justify-between text-[10px] text-muted-foreground select-none">
              <span>Use arrow keys to navigate, Esc to close</span>
              <span>⌘K to toggle</span>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

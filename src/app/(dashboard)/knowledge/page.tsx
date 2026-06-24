"use client";

import { useState } from "react";
import { useDocuments } from "@/hooks/queries/use-documents";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Folder, Plus, Search, Tag, Eye, Clock, User, ArrowRight, Loader2, PlusCircle, CheckCircle } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function KnowledgePage() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const {
    documents,
    isLoadingDocuments,
    categories,
    createCategory,
    isCreatingCategory,
  } = useDocuments(activeCategory || undefined, search || undefined);

  // Category modal state
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [categoryName, setCategoryName] = useState("");
  const [categoryColor, setCategoryColor] = useState("#6366f1");

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryName.trim()) return;

    try {
      await createCategory({ name: categoryName.trim(), color: categoryColor });
      toast.success("Category created successfully");
      setIsCategoryModalOpen(false);
      setCategoryName("");
    } catch {
      toast.error("Failed to create category");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Knowledge Base</h1>
          <p className="text-muted-foreground mt-1">
            Browse and publish documentation, guides, and corporate resources.
          </p>
        </div>
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="self-start">
          <Link
            href="/knowledge/new"
            className="flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-brand-500/25 hover:bg-brand-600 transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4" /> New Document
          </Link>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Left Sidebar - Categories Tree */}
        <div className="lg:col-span-1 space-y-4">
          <div className="border border-border bg-card p-4 rounded-2xl shadow-sm space-y-3">
            <div className="flex justify-between items-center pb-2 border-b border-border/60">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Categories</span>
              <button
                onClick={() => setIsCategoryModalOpen(true)}
                className="text-muted-foreground hover:text-brand-500 transition-colors cursor-pointer"
              >
                <PlusCircle className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-1">
              <button
                onClick={() => setActiveCategory(null)}
                className={cn(
                  "w-full text-left px-3 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-2 cursor-pointer",
                  !activeCategory
                    ? "bg-brand-500/10 text-brand-500 font-bold"
                    : "text-muted-foreground hover:bg-muted"
                )}
              >
                <BookOpen className="h-3.5 w-3.5" /> All Documents
              </button>

              {categories.map((cat: any) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={cn(
                    "w-full text-left px-3 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-2 cursor-pointer",
                    activeCategory === cat.id
                      ? "bg-brand-500/10 text-brand-500 font-bold"
                      : "text-muted-foreground hover:bg-muted"
                  )}
                >
                  <Folder className="h-3.5 w-3.5" style={{ color: cat.color }} />
                  <span className="truncate">{cat.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Pane - Documents list */}
        <div className="lg:col-span-3 space-y-4">
          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search documents by title or contents..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex h-9 w-full rounded-lg border border-input bg-background pl-9 pr-4 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>

          {/* List display */}
          {isLoadingDocuments ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
              <p className="text-sm text-muted-foreground font-medium">Loading documents...</p>
            </div>
          ) : documents.length === 0 ? (
            <div className="flex flex-col items-center justify-center border border-dashed rounded-xl p-12 text-center bg-card">
              <BookOpen className="h-10 w-10 text-muted-foreground mb-4" />
              <h3 className="text-sm font-semibold">No documents found</h3>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                Publish guides, checklists, or resources in the knowledge base.
              </p>
              <Link
                href="/knowledge/new"
                className="mt-4 flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600 transition-colors"
              >
                <Plus className="h-4 w-4" /> New Document
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {documents.map((doc: any, i: number) => (
                <motion.div
                  key={doc.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.02 }}
                >
                  <Link
                    href={`/knowledge/${doc.id}`}
                    className="block border border-border bg-card p-5 rounded-2xl shadow-sm hover:shadow-md transition-all group flex flex-col justify-between min-h-[160px]"
                  >
                    <div>
                      <div className="flex justify-between items-start gap-2 mb-2">
                        <span
                          className="text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1"
                          style={{
                            backgroundColor: `${doc.category?.color || "#6366f1"}15`,
                            color: doc.category?.color || "#6366f1",
                          }}
                        >
                          <Folder className="h-2.5 w-2.5" />
                          {doc.category?.name || "General"}
                        </span>

                        {doc.isPublished && (
                          <span className="text-[9px] font-bold text-emerald-500 flex items-center gap-0.5">
                            <CheckCircle className="h-2.5 w-2.5" /> Published
                          </span>
                        )}
                      </div>

                      <h3 className="text-sm font-semibold leading-snug group-hover:text-brand-500 transition-colors line-clamp-1">
                        {doc.title}
                      </h3>
                      {doc.content && (
                        <p className="text-xs text-muted-foreground line-clamp-2 mt-2 leading-relaxed">
                          {doc.content.replace(/[#*`]/g, "")}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-4 mt-4 border-t border-border/40">
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {doc.createdBy?.name || "Anonymous"}
                      </div>
                      <div className="flex items-center gap-1.5 font-semibold text-brand-500 opacity-0 group-hover:opacity-100 transition-opacity">
                        Read <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Category Creation Modal */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-card border border-border p-5 rounded-2xl max-w-sm w-full space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="text-sm font-bold">New Category</h3>
              <button
                onClick={() => setIsCategoryModalOpen(false)}
                className="text-muted-foreground hover:text-foreground text-lg cursor-pointer"
              >
                &times;
              </button>
            </div>
            <form onSubmit={handleCreateCategory} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold mb-1 text-muted-foreground">Category Name</label>
                <input
                  type="text"
                  required
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  className="flex h-9 w-full rounded-lg border border-input bg-background px-3 py-1 text-xs"
                  placeholder="e.g. Onboarding Guides"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1 text-muted-foreground">Theme Color</label>
                <input
                  type="color"
                  value={categoryColor}
                  onChange={(e) => setCategoryColor(e.target.value)}
                  className="flex h-9 w-full rounded-lg border border-input bg-background p-1"
                />
              </div>
              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="flex-1 py-1.5 border border-border rounded-lg text-xs font-semibold hover:bg-accent cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingCategory || !categoryName.trim()}
                  className="flex-1 py-1.5 bg-brand-500 text-white rounded-lg text-xs font-semibold hover:bg-brand-600 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1"
                >
                  {isCreatingCategory && <Loader2 className="h-3 w-3 animate-spin" />}
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

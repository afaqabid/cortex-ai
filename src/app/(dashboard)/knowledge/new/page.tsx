"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDocuments } from "@/hooks/queries/use-documents";
import { motion } from "framer-motion";
import { ArrowLeft, Save, Loader2, Sparkles, BookOpen, Eye } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function NewDocumentPage() {
  const router = useRouter();
  const { createDocument, categories, isCreatingDocument } = useDocuments();

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    categoryId: "",
    isPublished: false,
  });

  const [activeMode, setActiveMode] = useState<"write" | "preview">("write");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    try {
      await createDocument({
        title: formData.title.trim(),
        content: formData.content.trim() || undefined,
        categoryId: formData.categoryId || null,
        isPublished: formData.isPublished,
      });
      toast.success("Document created successfully");
      router.push("/knowledge");
    } catch {
      toast.error("Failed to create document");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/knowledge"
          className="p-2 border border-border bg-card rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold tracking-tight">Create Document</h1>
          <p className="text-xs text-muted-foreground">Publish a new resource in the knowledge base.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Editor Pane */}
        <form onSubmit={handleSubmit} className="lg:col-span-8 space-y-4">
          <div className="border border-border bg-card p-5 rounded-2xl space-y-4 shadow-sm">
            <div>
              <label className="block text-xs font-semibold mb-1 text-muted-foreground">Title</label>
              <input
                type="text"
                required
                placeholder="e.g. Employee Handbooks & SLA"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="flex h-10 w-full rounded-lg border border-input bg-background px-3 text-sm focus-visible:outline-none"
              />
            </div>

            {/* Mode switch */}
            <div className="flex items-center bg-muted rounded-lg p-0.5 w-fit">
              <button
                type="button"
                onClick={() => setActiveMode("write")}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                  activeMode === "write" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
                }`}
              >
                Write
              </button>
              <button
                type="button"
                onClick={() => setActiveMode("preview")}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                  activeMode === "preview" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
                }`}
              >
                Preview
              </button>
            </div>

            {/* Textarea or Preview */}
            {activeMode === "write" ? (
              <div>
                <label className="block text-xs font-semibold mb-1 text-muted-foreground">Content (Markdown supported)</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="## Setup guide&#10;1. Clone the repository...&#10;Write resource guides here..."
                  rows={14}
                  className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-xs focus-visible:outline-none resize-none font-mono"
                />
              </div>
            ) : (
              <div className="border border-border bg-card/40 p-4 rounded-lg min-h-[300px] prose dark:prose-invert max-w-none text-xs leading-relaxed whitespace-pre-wrap">
                {formData.content || "*No content provided yet.*"}
              </div>
            )}
          </div>
        </form>

        {/* Sidebar Parameters */}
        <div className="lg:col-span-4 border border-border bg-card p-5 rounded-2xl shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider pb-2 border-b">
            Settings
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold mb-1 text-muted-foreground">Category</label>
              <select
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                className="flex h-9 w-full rounded-lg border border-input bg-background px-3 text-xs focus-visible:outline-none"
              >
                <option value="">General</option>
                {categories.map((c: any) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-between py-2 border-y border-border/60">
              <div>
                <p className="text-xs font-semibold">Publish Status</p>
                <p className="text-[10px] text-muted-foreground">Available to other members if published.</p>
              </div>
              <input
                type="checkbox"
                checked={formData.isPublished}
                onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                className="h-4.5 w-4.5 accent-brand-500 rounded border-gray-300"
              />
            </div>

            <div className="pt-4 flex gap-3">
              <Link
                href="/knowledge"
                className="flex-1 py-2 text-center border border-border bg-card rounded-lg text-xs font-semibold hover:bg-accent cursor-pointer"
              >
                Cancel
              </Link>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isCreatingDocument || !formData.title.trim()}
                className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-brand-500 text-white py-2 text-xs font-semibold shadow-lg hover:bg-brand-600 disabled:opacity-50 cursor-pointer"
              >
                {isCreatingDocument ? <Loader2 className="h-4.5 w-4.5 animate-spin" /> : <Save className="h-4.5 w-4.5" />}
                Save Doc
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

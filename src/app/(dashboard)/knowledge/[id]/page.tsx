"use client";

import { use, useState } from "react";
import { useDocumentDetails, useDocuments } from "@/hooks/queries/use-documents";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Edit2,
  Trash2,
  Save,
  Loader2,
  Folder,
  Calendar,
  User,
  History,
  CheckCircle,
  Eye,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface DocumentDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function DocumentDetailPage({ params }: DocumentDetailPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const {
    document,
    isLoadingDocument,
    updateDocument,
    isUpdatingDocument,
    deleteDocument,
    isDeletingDocument,
  } = useDocumentDetails(id);
  const { categories } = useDocuments();

  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    categoryId: "",
    isPublished: false,
  });

  const [activeTab, setActiveTab] = useState<"read" | "history">("read");

  if (isLoadingDocument) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
        <p className="text-sm text-muted-foreground font-medium">Loading document...</p>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="text-center py-20 bg-card border rounded-xl">
        <h3 className="text-lg font-semibold text-destructive">Document Not Found</h3>
        <p className="text-sm text-muted-foreground mt-1">This document does not exist or you do not have permission to view it.</p>
        <Link href="/knowledge" className="mt-4 inline-flex items-center gap-2 text-sm text-brand-500 font-semibold hover:underline">
          <ArrowLeft className="h-4 w-4" /> Back to knowledge base
        </Link>
      </div>
    );
  }

  const handleOpenEdit = () => {
    setFormData({
      title: document.title,
      content: document.content || "",
      categoryId: document.categoryId || "",
      isPublished: document.isPublished,
    });
    setIsEditMode(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    try {
      await updateDocument({
        title: formData.title.trim(),
        content: formData.content.trim() || undefined,
        categoryId: formData.categoryId || null,
        isPublished: formData.isPublished,
      });
      toast.success("Document updated successfully");
      setIsEditMode(false);
    } catch {
      toast.error("Failed to update document");
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this document?")) return;
    try {
      await deleteDocument();
      toast.success("Document deleted");
      router.push("/knowledge");
    } catch {
      toast.error("Failed to delete document");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            href="/knowledge"
            className="p-2 border border-border bg-card rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-xl font-bold tracking-tight truncate max-w-[300px]">
              {document.title}
            </h1>
            <p className="text-xs text-muted-foreground">
              Last updated: {new Date(document.updatedAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!isEditMode ? (
            <>
              <button
                onClick={handleOpenEdit}
                className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3.5 py-2 text-xs font-semibold hover:bg-accent cursor-pointer"
              >
                <Edit2 className="h-4 w-4" /> Edit Document
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeletingDocument}
                className="flex items-center gap-1.5 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white px-3.5 py-2 text-xs font-semibold disabled:opacity-50 cursor-pointer transition-colors"
              >
                {isDeletingDocument ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
                Delete
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setIsEditMode(false)}
                className="px-3.5 py-2 rounded-lg border border-border bg-card text-xs font-semibold hover:bg-accent cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isUpdatingDocument || !formData.title.trim()}
                className="flex items-center gap-1.5 rounded-lg bg-brand-500 px-3.5 py-2 text-xs font-semibold text-white shadow-lg hover:bg-brand-600 disabled:opacity-50 cursor-pointer"
              >
                {isUpdatingDocument ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Save Changes
              </button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Main Content Pane */}
        <div className="lg:col-span-8 space-y-4">
          <div className="border border-border bg-card p-6 rounded-2xl shadow-sm space-y-4">
            {!isEditMode ? (
              <div className="space-y-6">
                <div className="flex items-center gap-2.5">
                  <span
                    className="text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1"
                    style={{
                      backgroundColor: `${document.category?.color || "#6366f1"}15`,
                      color: document.category?.color || "#6366f1",
                    }}
                  >
                    <Folder className="h-2.5 w-2.5" />
                    {document.category?.name || "General"}
                  </span>
                  {document.isPublished && (
                    <span className="text-[9px] font-bold text-emerald-500 flex items-center gap-0.5">
                      <CheckCircle className="h-2.5 w-2.5" /> Published
                    </span>
                  )}
                </div>

                <h1 className="text-2xl font-extrabold tracking-tight border-b pb-3">{document.title}</h1>

                <div className="prose dark:prose-invert max-w-none text-xs leading-relaxed whitespace-pre-wrap text-foreground/95">
                  {document.content || "*No content written.*"}
                </div>
              </div>
            ) : (
              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold mb-1 text-muted-foreground">Title</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="flex h-10 w-full rounded-lg border border-input bg-background px-3 text-xs focus-visible:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1 text-muted-foreground">Content (Markdown)</label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    rows={12}
                    className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-xs focus-visible:outline-none font-mono"
                  />
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Sidebar Parameters / Version History */}
        <div className="lg:col-span-4 space-y-6 no-print">
          {/* Settings Panel during Edit */}
          {isEditMode && (
            <div className="border border-border bg-card p-5 rounded-2xl shadow-sm space-y-4">
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider pb-2 border-b">
                Publish settings
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
                    <p className="text-[10px] text-muted-foreground">Available to organization members.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.isPublished}
                    onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                    className="h-4.5 w-4.5 accent-brand-500 rounded border-gray-300"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Metadata info */}
          <div className="border border-border bg-card p-5 rounded-2xl shadow-sm space-y-3">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider pb-2 border-b">
              Metadata
            </h3>
            <div className="space-y-3 text-xs">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Author</p>
                  <p className="font-semibold">{document.createdBy?.name || "Anonymous"}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Published on</p>
                  <p className="font-semibold">{new Date(document.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Version Logs Panel */}
          <div className="border border-border bg-card p-5 rounded-2xl shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider pb-2 border-b flex items-center gap-1.5">
              <History className="h-4 w-4 text-brand-500" /> Version History
            </h3>
            {document.versions && document.versions.length > 0 ? (
              <div className="space-y-3">
                {document.versions.map((ver: any) => (
                  <div key={ver.id} className="p-3 border rounded-xl bg-card/60 space-y-1">
                    <div className="flex justify-between items-center text-[10px] font-bold text-brand-500">
                      <span>Version {ver.version}</span>
                      <span className="text-muted-foreground font-medium">
                        {new Date(ver.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    {ver.content && (
                      <p className="text-[10px] text-muted-foreground line-clamp-1 mt-1 font-mono">
                        {ver.content.slice(0, 40)}...
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground italic">No historical version logs.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

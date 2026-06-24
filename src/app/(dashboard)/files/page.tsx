"use client";

import { useState } from "react";
import { useFiles } from "@/hooks/queries/use-files";
import {
  Folder,
  File as FileIcon,
  FileText,
  Image as ImageIcon,
  Video as VideoIcon,
  Music as AudioIcon,
  Plus,
  Trash2,
  Upload,
  ChevronRight,
  Home,
  Grid,
  List as ListIcon,
  Search,
  Loader2,
  FolderPlus,
} from "lucide-react";
import { toast } from "sonner";

export default function FilesPage() {
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [folderStack, setFolderStack] = useState<{ id: string; name: string }[]>([]);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [newFolderName, setNewFolderName] = useState("");
  const [isFolderDialogOpen, setIsFolderDialogOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const {
    files,
    folders,
    isLoadingFiles,
    isLoadingFolders,
    createFolder,
    uploadFile,
    deleteFile,
    deleteFolder,
  } = useFiles(currentFolderId);

  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;

    try {
      await createFolder({
        name: newFolderName,
        parentId: currentFolderId,
      });
      toast.success(`Folder "${newFolderName}" created successfully.`);
      setNewFolderName("");
      setIsFolderDialogOpen(false);
    } catch (err) {
      toast.error("Failed to create folder.");
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;

    setIsUploading(true);
    try {
      for (let i = 0; i < fileList.length; i++) {
        await uploadFile({
          file: fileList[i],
          folderId: currentFolderId,
        });
      }
      toast.success("Files uploaded successfully.");
    } catch (err) {
      toast.error("Failed to upload one or more files.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteFile = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete ${name}?`)) return;
    try {
      await deleteFile(id);
      toast.success("File deleted successfully.");
    } catch (err) {
      toast.error("Failed to delete file.");
    }
  };

  const handleDeleteFolder = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete folder "${name}"? All nested contents will remain in database as detached but this folder will be deleted.`)) return;
    try {
      await deleteFolder(id);
      toast.success("Folder deleted successfully.");
    } catch (err) {
      toast.error("Failed to delete folder.");
    }
  };

  const enterFolder = (id: string, name: string) => {
    setCurrentFolderId(id);
    setFolderStack((prev) => [...prev, { id, name }]);
  };

  const navigateToBreadcrumb = (index: number) => {
    if (index === -1) {
      setCurrentFolderId(null);
      setFolderStack([]);
    } else {
      const target = folderStack[index];
      setCurrentFolderId(target.id);
      setFolderStack(folderStack.slice(0, index + 1));
    }
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith("image/")) return <ImageIcon className="h-10 w-10 text-emerald-500" />;
    if (mimeType.startsWith("video/")) return <VideoIcon className="h-10 w-10 text-blue-500" />;
    if (mimeType.startsWith("audio/")) return <AudioIcon className="h-10 w-10 text-purple-500" />;
    if (mimeType.includes("pdf") || mimeType.includes("document") || mimeType.includes("text")) {
      return <FileText className="h-10 w-10 text-orange-500" />;
    }
    return <FileIcon className="h-10 w-10 text-gray-500" />;
  };

  const getListFileIcon = (mimeType: string) => {
    if (mimeType.startsWith("image/")) return <ImageIcon className="h-5 w-5 text-emerald-500" />;
    if (mimeType.startsWith("video/")) return <VideoIcon className="h-5 w-5 text-blue-500" />;
    if (mimeType.startsWith("audio/")) return <AudioIcon className="h-5 w-5 text-purple-500" />;
    if (mimeType.includes("pdf") || mimeType.includes("document") || mimeType.includes("text")) {
      return <FileText className="h-5 w-5 text-orange-500" />;
    }
    return <FileIcon className="h-5 w-5 text-gray-500" />;
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const filteredFolders = folders.filter((f: any) =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredFiles = files.filter((f: any) =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Header Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
            File Manager
          </h1>
          <p className="text-muted-foreground text-sm">
            Store, organize, and share assets across your organization.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Create Folder Trigger */}
          <button
            onClick={() => setIsFolderDialogOpen(true)}
            className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3.5 py-1.5 text-xs font-semibold hover:bg-muted transition-all cursor-pointer"
          >
            <FolderPlus className="h-4 w-4" />
            New Folder
          </button>

          {/* Upload Button */}
          <div className="relative">
            <input
              type="file"
              id="file-upload"
              multiple
              className="sr-only"
              onChange={handleFileUpload}
              disabled={isUploading}
            />
            <button
              disabled={isUploading}
              className="flex items-center gap-1.5 rounded-lg bg-brand-500 text-white px-3.5 py-1.5 text-xs font-semibold hover:bg-brand-600 transition-all cursor-pointer disabled:opacity-50"
            >
              <label htmlFor="file-upload" className="flex items-center gap-1.5 cursor-pointer">
                {isUploading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4" />
                )}
                Upload Files
              </label>
            </button>
          </div>
        </div>
      </div>

      {/* Folder Dialog modal */}
      {isFolderDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="bg-card border border-border p-6 rounded-xl w-full max-w-md space-y-4">
            <h2 className="text-base font-bold">Create Folder</h2>
            <form onSubmit={handleCreateFolder} className="space-y-4">
              <input
                type="text"
                required
                placeholder="Folder Name"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                className="flex h-9 w-full rounded-lg border border-input bg-background px-3 py-1 text-xs focus-visible:outline-none"
              />
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setIsFolderDialogOpen(false)}
                  className="px-3 py-1.5 rounded-lg border border-input bg-background text-xs hover:bg-accent cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 rounded-lg bg-brand-500 text-white text-xs font-semibold hover:bg-brand-600 cursor-pointer"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Control Bar: Search + Views */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between bg-card p-3 rounded-xl border border-slate-100 dark:border-slate-800">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            placeholder="Search folders and files..."
            className="pl-9 pr-3 py-2 text-xs w-full bg-muted/50 border-none rounded-lg focus:outline-none"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            className={`h-8 w-8 flex items-center justify-center rounded-lg ${viewMode === "grid" ? "bg-muted text-foreground" : "text-muted-foreground hover:bg-muted"}`}
            onClick={() => setViewMode("grid")}
          >
            <Grid className="h-4 w-4" />
          </button>
          <button
            className={`h-8 w-8 flex items-center justify-center rounded-lg ${viewMode === "list" ? "bg-muted text-foreground" : "text-muted-foreground hover:bg-muted"}`}
            onClick={() => setViewMode("list")}
          >
            <ListIcon className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Breadcrumbs */}
      <div className="flex items-center gap-1 text-sm text-muted-foreground flex-wrap">
        <button
          onClick={() => navigateToBreadcrumb(-1)}
          className="flex items-center gap-1.5 hover:text-foreground transition-colors font-medium cursor-pointer"
        >
          <Home className="h-4 w-4" />
          Root
        </button>
        {folderStack.map((item, index) => (
          <div key={item.id} className="flex items-center gap-1">
            <ChevronRight className="h-4 w-4" />
            <button
              onClick={() => navigateToBreadcrumb(index)}
              className={`hover:text-foreground transition-colors cursor-pointer ${
                index === folderStack.length - 1 ? "text-foreground font-semibold" : "font-medium"
              }`}
            >
              {item.name}
            </button>
          </div>
        ))}
      </div>

      {/* Folder & Files List Area */}
      {isLoadingFiles || isLoadingFolders ? (
        <div className="flex h-48 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : filteredFolders.length === 0 && filteredFiles.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed rounded-2xl border-slate-200 dark:border-slate-800 p-8 text-center bg-card">
          <Folder className="h-16 w-16 text-muted-foreground/30 mb-4" />
          <h3 className="font-semibold text-lg">No Items Found</h3>
          <p className="text-muted-foreground text-sm max-w-sm mt-1">
            {searchQuery ? "No matches found for your search query." : "Upload files or create subfolders to get started."}
          </p>
        </div>
      ) : viewMode === "grid" ? (
        <div className="space-y-6">
          {/* Folders Grid */}
          {filteredFolders.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Folders ({filteredFolders.length})
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {filteredFolders.map((folder: any) => (
                  <div
                    key={folder.id}
                    className="group relative cursor-pointer border border-border rounded-xl p-4 flex flex-col items-center justify-center text-center hover:shadow-md hover:border-brand-500/30 transition-all overflow-hidden bg-card"
                    onClick={() => enterFolder(folder.id, folder.name)}
                  >
                    <Folder className="h-12 w-12 text-blue-500 fill-blue-500/10 group-hover:scale-105 transition-transform" />
                    <span className="mt-2 text-sm font-medium truncate w-full px-1">
                      {folder.name}
                    </span>

                    <button
                      className="absolute top-1 right-1 h-7 w-7 flex items-center justify-center rounded-md opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-all"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteFolder(folder.id, folder.name);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Files Grid */}
          {filteredFiles.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Files ({filteredFiles.length})
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {filteredFiles.map((file: any) => (
                  <div
                    key={file.id}
                    className="group relative border border-border rounded-xl hover:shadow-md hover:border-brand-500/30 transition-all overflow-hidden bg-card"
                  >
                    <a
                      href={file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-4 flex flex-col items-center justify-center text-center cursor-pointer"
                    >
                      {getFileIcon(file.mimeType)}
                      <span className="mt-2 text-sm font-medium truncate w-full px-1 text-slate-800 dark:text-slate-100">
                        {file.name}
                      </span>
                      <span className="text-[10px] text-muted-foreground mt-0.5">
                        {formatBytes(file.size)}
                      </span>
                    </a>

                    <button
                      className="absolute top-1 right-1 h-7 w-7 flex items-center justify-center rounded-md opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-all"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteFile(file.id, file.name);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* List View */
        <div className="bg-card border rounded-xl overflow-hidden">
          <div className="grid grid-cols-12 gap-4 px-4 py-2 bg-muted/40 border-b text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            <div className="col-span-6 sm:col-span-7">Name</div>
            <div className="col-span-3 sm:col-span-2">Size</div>
            <div className="col-span-3">Actions</div>
          </div>

          <div className="divide-y divide-border">
            {/* Folders */}
            {filteredFolders.map((folder: any) => (
              <div
                key={folder.id}
                className="grid grid-cols-12 gap-4 px-4 py-3 items-center hover:bg-muted/30 cursor-pointer transition-colors"
                onClick={() => enterFolder(folder.id, folder.name)}
              >
                <div className="col-span-6 sm:col-span-7 flex items-center gap-3">
                  <Folder className="h-5 w-5 text-blue-500 fill-blue-500/10 shrink-0" />
                  <span className="text-sm font-medium truncate">{folder.name}</span>
                </div>
                <div className="col-span-3 sm:col-span-2 text-xs text-muted-foreground">
                  —
                </div>
                <div className="col-span-3 flex items-center gap-2">
                  <button
                    className="h-8 w-8 flex items-center justify-center rounded-md text-muted-foreground hover:text-red-500 hover:bg-red-500/10"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteFolder(folder.id, folder.name);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}

            {/* Files */}
            {filteredFiles.map((file: any) => (
              <div
                key={file.id}
                className="grid grid-cols-12 gap-4 px-4 py-3 items-center hover:bg-muted/30 transition-colors"
              >
                <a
                  href={file.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="col-span-6 sm:col-span-7 flex items-center gap-3 truncate"
                >
                  {getListFileIcon(file.mimeType)}
                  <span className="text-sm font-medium truncate text-slate-800 dark:text-slate-100">
                    {file.name}
                  </span>
                </a>
                <div className="col-span-3 sm:col-span-2 text-xs text-muted-foreground">
                  {formatBytes(file.size)}
                </div>
                <div className="col-span-3 flex items-center gap-2">
                  <button
                    className="h-8 w-8 flex items-center justify-center rounded-md text-muted-foreground hover:text-red-500 hover:bg-red-500/10"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteFile(file.id, file.name);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

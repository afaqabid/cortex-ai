"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Search, Grid3X3, List, Calendar, MoreHorizontal, Loader2, X, Trash2, FolderKanban, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { PROJECT_STATUS_LABELS, PROJECT_STATUS_COLORS } from "@/lib/constants";
import { useProjects } from "@/hooks/queries/use-projects";
import { useTeam } from "@/hooks/queries/use-team";
import { toast } from "sonner";

export default function ProjectsPage() {
  const { projects, isLoadingProjects, createProject, deleteProject } = useProjects();
  const { members } = useTeam();
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  // Form states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    status: "PLANNING" as any,
    startDate: "",
    endDate: "",
    budget: 0,
    color: "#6366f1",
    createdById: "",
  });

  const handleOpenCreate = () => {
    setFormData({
      name: "",
      description: "",
      status: "PLANNING",
      startDate: "",
      endDate: "",
      budget: 0,
      color: "#6366f1",
      createdById: "",
    });
    setIsFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createProject(formData);
      toast.success("Project created successfully");
      setIsFormOpen(false);
    } catch {
      toast.error("Failed to create project");
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this project?")) return;
    try {
      await deleteProject(id);
      toast.success("Project deleted successfully");
    } catch {
      toast.error("Failed to delete project");
    }
  };

  const filtered = projects.filter((p: any) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = !statusFilter || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Projects</h1>
          <p className="text-muted-foreground mt-1">
            {projects.length} projects · {projects.filter((p: any) => p.status === "ACTIVE").length} active
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleOpenCreate}
          className="flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-brand-500/25 hover:bg-brand-600 transition-all self-start cursor-pointer"
        >
          <Plus className="h-4 w-4" /> New Project
        </motion.button>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search projects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex h-9 w-full rounded-lg border border-input bg-background pl-9 pr-4 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors"
          />
        </div>
        <div className="flex items-center gap-2">
          {["ACTIVE", "PLANNING", "ON_HOLD", "COMPLETED"].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(statusFilter === s ? null : s)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer",
                statusFilter === s
                  ? "bg-brand-500 text-white"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              )}
            >
              <div className="h-2 w-2 rounded-full" style={{ backgroundColor: PROJECT_STATUS_COLORS[s] }} />
              {PROJECT_STATUS_LABELS[s]}
            </button>
          ))}
        </div>
        <div className="flex items-center border border-border rounded-lg overflow-hidden ml-auto bg-card">
          <button
            onClick={() => setViewMode("grid")}
            className={cn("p-2 transition-colors cursor-pointer", viewMode === "grid" ? "bg-accent text-foreground" : "text-muted-foreground")}
          >
            <Grid3X3 className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={cn("p-2 transition-colors cursor-pointer", viewMode === "list" ? "bg-accent text-foreground" : "text-muted-foreground")}
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>

      {isLoadingProjects ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
          <p className="text-sm text-muted-foreground">Loading projects...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center border border-dashed rounded-xl p-12 text-center bg-card">
          <FolderKanban className="h-10 w-10 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold">No projects found</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-sm">
            Create your first project to manage tasks, timelines, and milestones.
          </p>
          <button
            onClick={handleOpenCreate}
            className="mt-4 flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white shadow-lg hover:bg-brand-600 transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            New Project
          </button>
        </div>
      ) : (
        <div className={cn(viewMode === "grid" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" : "space-y-3")}>
          {filtered.map((project: any, i: number) => {
            const progress = 0; // Calculated based on tasks in future phases
            return (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                whileHover={{ y: viewMode === "grid" ? -2 : 0 }}
              >
                <Link
                  href={`/projects/${project.id}`}
                  className={cn(
                    "block rounded-xl border border-border bg-card hover:shadow-lg transition-all group relative",
                    viewMode === "list" && "flex items-center gap-4 p-4",
                    viewMode === "grid" && "p-5"
                  )}
                >
                  {viewMode === "grid" ? (
                    <>
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="h-3 w-3 rounded-full" style={{ backgroundColor: project.color }} />
                          <span
                            className="text-xs font-medium px-2 py-0.5 rounded-full"
                            style={{
                              backgroundColor: `${PROJECT_STATUS_COLORS[project.status]}15`,
                              color: PROJECT_STATUS_COLORS[project.status],
                            }}
                          >
                            {PROJECT_STATUS_LABELS[project.status]}
                          </span>
                        </div>
                        <button
                          className="opacity-0 group-hover:opacity-100 p-1 rounded-md text-red-500 hover:bg-red-500/10 transition-all cursor-pointer"
                          onClick={(e) => handleDelete(project.id, e)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <h3 className="text-sm font-semibold mb-1">{project.name}</h3>
                      {project.description && (
                        <p className="text-xs text-muted-foreground line-clamp-2 mb-4">
                          {project.description}
                        </p>
                      )}
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-muted-foreground">{project._count?.tasks || 0} tasks</span>
                            <span className="font-medium">{progress}%</span>
                          </div>
                          <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${progress}%` }}
                              className="h-full rounded-full"
                              style={{ backgroundColor: project.color }}
                            />
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border">
                          <div className="flex items-center gap-1">
                            <Building2 className="h-3 w-3" />
                            {project.client?.company || "No Client"}
                          </div>
                          {project.createdBy && (
                            <div className="flex items-center gap-1 bg-muted/60 px-2 py-0.5 rounded-full text-[10px]" title={`Project Lead: ${project.createdBy.name}`}>
                              <div className="h-3.5 w-3.5 rounded-full bg-brand-500/10 text-brand-500 flex items-center justify-center font-bold text-[8px]">
                                {project.createdBy.name[0].toUpperCase()}
                              </div>
                              <span className="max-w-[70px] truncate">{project.createdBy.name}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div
                        className="h-10 w-10 rounded-lg shrink-0 flex items-center justify-center"
                        style={{ backgroundColor: `${project.color}20` }}
                      >
                        <div className="h-3 w-3 rounded-full" style={{ backgroundColor: project.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold">{project.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{project.description || "No description"}</p>
                      </div>
                      <span
                        className="text-xs font-medium px-2.5 py-1 rounded-full shrink-0"
                        style={{
                          backgroundColor: `${PROJECT_STATUS_COLORS[project.status]}15`,
                          color: PROJECT_STATUS_COLORS[project.status],
                        }}
                      >
                        {PROJECT_STATUS_LABELS[project.status]}
                      </span>
                      <span className="text-xs text-muted-foreground shrink-0 hidden lg:block">
                        {project.client?.company || "No Client"}
                      </span>
                      {project.createdBy && (
                        <span className="text-xs text-muted-foreground shrink-0 hidden md:block">
                          Lead: {project.createdBy.name}
                        </span>
                      )}
                      <button
                        className="opacity-0 group-hover:opacity-100 p-1.5 rounded-md text-red-500 hover:bg-red-500/10 transition-all cursor-pointer"
                        onClick={(e) => handleDelete(project.id, e)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </>
                  )}
                </Link>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Side Sheet Form */}
      <AnimatePresence>
        {isFormOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFormOpen(false)}
              className="fixed inset-0 bg-black z-40"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-card border-l border-border p-6 shadow-2xl z-50 overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold">New Project</h3>
                <button
                  onClick={() => setIsFormOpen(false)}
                  className="p-1 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5">Project Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors"
                    placeholder="SaaS Platform Development"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors"
                    placeholder="Provide overview of goals, scope, and parameters..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                      className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors"
                    >
                      {Object.entries(PROJECT_STATUS_LABELS).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Theme Color</label>
                    <input
                      type="color"
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      className="flex h-10 w-full rounded-lg border border-input bg-background p-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Start Date</label>
                    <input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">End Date</label>
                    <input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Budget ($)</label>
                    <input
                      type="number"
                      value={formData.budget}
                      onChange={(e) => setFormData({ ...formData, budget: Number(e.target.value) })}
                      className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Project Lead</label>
                    <select
                      value={formData.createdById}
                      onChange={(e) => setFormData({ ...formData, createdById: e.target.value })}
                      className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors"
                    >
                      <option value="">Default (Current User)</option>
                      {members.map((member: any) => (
                        <option key={member.user?.id} value={member.user?.id}>
                          {member.user?.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="pt-4 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsFormOpen(false)}
                    className="flex-1 rounded-lg border border-input bg-background py-2 text-sm font-semibold hover:bg-accent transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 rounded-lg bg-brand-500 text-white py-2 text-sm font-semibold shadow-lg hover:bg-brand-600 transition-all cursor-pointer"
                  >
                    Save Project
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

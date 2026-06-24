"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Search, CheckSquare, Clock, AlertCircle, X, Loader2, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  TASK_STATUS_LABELS,
  TASK_STATUS_COLORS,
  TASK_PRIORITY_LABELS,
  TASK_PRIORITY_COLORS,
} from "@/lib/constants";
import { useTasks } from "@/hooks/queries/use-tasks";
import { useProjects } from "@/hooks/queries/use-projects";
import { toast } from "sonner";

export default function TasksPage() {
  const { tasks, isLoadingTasks, createTask, deleteTask, updateTask } = useTasks();
  const { projects } = useProjects();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [view, setView] = useState<"all" | "my">("all");

  // Form states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    status: "TODO" as any,
    priority: "MEDIUM" as any,
    dueDate: "",
    projectId: "",
  });

  const handleOpenCreate = () => {
    setFormData({
      title: "",
      description: "",
      status: "TODO",
      priority: "MEDIUM",
      dueDate: "",
      projectId: projects[0]?.id || "",
    });
    setIsFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.projectId) {
      toast.error("Please create a project first before adding tasks.");
      return;
    }
    try {
      await createTask(formData);
      toast.success("Task created successfully");
      setIsFormOpen(false);
    } catch {
      toast.error("Failed to create task");
    }
  };

  const handleToggleComplete = async (task: any) => {
    const newStatus = task.status === "DONE" ? "TODO" : "DONE";
    try {
      await updateTask({
        id: task.id,
        data: { status: newStatus },
      });
      toast.success(`Task marked as ${newStatus === "DONE" ? "completed" : "incomplete"}`);
    } catch {
      toast.error("Failed to update task status");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this task?")) return;
    try {
      await deleteTask(id);
      toast.success("Task deleted successfully");
    } catch {
      toast.error("Failed to delete task");
    }
  };

  const filtered = tasks.filter((t: any) => {
    const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = !statusFilter || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statusCounts = tasks.reduce(
    (acc: Record<string, number>, t: any) => {
      acc[t.status] = (acc[t.status] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tasks</h1>
          <p className="text-muted-foreground mt-1">{tasks.length} tasks across all projects</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleOpenCreate}
          className="flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-brand-500/25 hover:bg-brand-600 transition-all self-start cursor-pointer"
        >
          <Plus className="h-4 w-4" /> New Task
        </motion.button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "To Do", count: statusCounts["TODO"] || 0, icon: CheckSquare, color: "text-blue-500", bg: "bg-blue-500/10" },
          { label: "In Progress", count: statusCounts["IN_PROGRESS"] || 0, icon: Clock, color: "text-amber-500", bg: "bg-amber-500/10" },
          { label: "In Review", count: statusCounts["IN_REVIEW"] || 0, icon: AlertCircle, color: "text-violet-500", bg: "bg-violet-500/10" },
          { label: "Done", count: statusCounts["DONE"] || 0, icon: CheckSquare, color: "text-emerald-500", bg: "bg-emerald-500/10" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg", s.bg)}>
                <s.icon className={cn("h-4 w-4", s.color)} />
              </div>
            </div>
            <p className="text-2xl font-bold">{s.count}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center bg-muted rounded-lg p-0.5">
          <button onClick={() => setView("all")} className={cn("px-3 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer", view === "all" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground")}>All Tasks</button>
          <button onClick={() => setView("my")} className={cn("px-3 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer", view === "my" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground")}>My Tasks</button>
        </div>
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex h-9 w-full rounded-lg border border-input bg-background pl-9 pr-4 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors"
          />
        </div>
      </div>

      {isLoadingTasks ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
          <p className="text-sm text-muted-foreground">Loading tasks...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center border border-dashed rounded-xl p-12 text-center bg-card">
          <CheckSquare className="h-10 w-10 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold">No tasks found</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-sm">
            Create tasks to delegate operations and organize your projects.
          </p>
          <button
            onClick={handleOpenCreate}
            className="mt-4 flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white shadow-lg hover:bg-brand-600 transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4" /> New Task
          </button>
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card overflow-hidden divide-y divide-border">
          {filtered.map((task: any, i: number) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.02 }}
              className="flex items-center gap-4 px-4 py-3 hover:bg-muted/30 transition-colors group cursor-pointer"
            >
              <button className="shrink-0 cursor-pointer" onClick={() => handleToggleComplete(task)}>
                <div className={cn("h-5 w-5 rounded border-2 flex items-center justify-center transition-colors", task.status === "DONE" ? "bg-emerald-500 border-emerald-500" : "border-muted-foreground/30 hover:border-brand-500")}>
                  {task.status === "DONE" && <CheckSquare className="h-3 w-3 text-white" />}
                </div>
              </button>
              <div className="flex-1 min-w-0">
                <p className={cn("text-sm font-medium", task.status === "DONE" && "line-through text-muted-foreground")}>{task.title}</p>
                <p className="text-xs text-muted-foreground">{task.project?.name || "No Project"}</p>
              </div>
              <span className="text-xs font-medium px-2 py-0.5 rounded-full shrink-0" style={{ backgroundColor: `${TASK_PRIORITY_COLORS[task.priority]}15`, color: TASK_PRIORITY_COLORS[task.priority] }}>
                {TASK_PRIORITY_LABELS[task.priority]}
              </span>
              <span className="text-xs font-medium px-2 py-0.5 rounded-full shrink-0 hidden sm:block" style={{ backgroundColor: `${TASK_STATUS_COLORS[task.status]}15`, color: TASK_STATUS_COLORS[task.status] }}>
                {TASK_STATUS_LABELS[task.status]}
              </span>
              <button
                className="opacity-0 group-hover:opacity-100 p-1 rounded-md text-red-500 hover:bg-red-500/10 transition-all cursor-pointer ml-auto"
                onClick={() => handleDelete(task.id)}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </motion.div>
          ))}
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
                <h3 className="text-lg font-bold">New Task</h3>
                <button onClick={() => setIsFormOpen(false)} className="p-1 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground cursor-pointer">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5">Task Title</label>
                  <input type="text" required value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors" placeholder="Complete user dashboard wiring" />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5">Description</label>
                  <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors" placeholder="Provide requirements or checklist items..." />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5">Project</label>
                  <select
                    value={formData.projectId}
                    onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
                    className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors"
                  >
                    {projects.map((project: any) => (
                      <option key={project.id} value={project.id}>
                        {project.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                      className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors"
                    >
                      {Object.entries(TASK_STATUS_LABELS).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Priority</label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                      className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors"
                    >
                      {Object.entries(TASK_PRIORITY_LABELS).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5">Due Date</label>
                  <input type="date" value={formData.dueDate} onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })} className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors" />
                </div>

                <div className="pt-4 flex gap-3">
                  <button type="button" onClick={() => setIsFormOpen(false)} className="flex-1 rounded-lg border border-input bg-background py-2 text-sm font-semibold hover:bg-accent transition-all cursor-pointer">Cancel</button>
                  <button type="submit" className="flex-1 rounded-lg bg-brand-500 text-white py-2 text-sm font-semibold shadow-lg hover:bg-brand-600 transition-all cursor-pointer">Save Task</button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

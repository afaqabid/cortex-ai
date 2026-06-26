"use client";

import { useState, use } from "react";
import { useProjects } from "@/hooks/queries/use-projects";
import { useTasks } from "@/hooks/queries/use-tasks";
import { useTeam } from "@/hooks/queries/use-team";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  DollarSign,
  User,
  Building2,
  ListTodo,
  Kanban,
  Clock,
  MessageSquare,
  ArrowLeft,
  ChevronRight,
  Plus,
  Loader2,
  Trash2,
  Building,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// Sub components
import { MilestoneTracker } from "@/components/projects/milestone-tracker";
import { KanbanBoard } from "@/components/projects/kanban-board";
import { TimelineChart } from "@/components/projects/timeline-chart";
import { CommentSection } from "@/components/shared/comment-section";

interface ProjectDetailPageProps {
  params: Promise<{ id: string }>;
}

type TabType = "overview" | "tasks" | "board" | "timeline" | "discussions";

export default function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const { id } = use(params);
  const { getProjectQuery, updateProject } = useProjects();
  const { data: project, isLoading: isLoadingProject } = getProjectQuery(id);
  const { tasks, isLoadingTasks, createTask, updateTask, deleteTask } = useTasks(id);
  const { members } = useTeam();

  const [activeTab, setActiveTab] = useState<TabType>("overview");

  // Task form state
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
  const [taskForm, setTaskForm] = useState({
    title: "",
    description: "",
    priority: "MEDIUM" as any,
    status: "TODO" as any,
    dueDate: "",
    startDate: "",
    assigneeId: "",
  });
  const [isCreatingTask, setIsCreatingTask] = useState(false);

  if (isLoadingProject) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
        <p className="text-sm text-muted-foreground font-medium">Loading project details...</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-20 bg-card border rounded-xl">
        <h3 className="text-lg font-semibold text-destructive">Project Not Found</h3>
        <p className="text-sm text-muted-foreground mt-1">This project does not exist or you do not have permission to view it.</p>
        <Link href="/projects" className="mt-4 inline-flex items-center gap-2 text-sm text-brand-500 font-semibold hover:underline">
          <ArrowLeft className="h-4 w-4" /> Back to projects
        </Link>
      </div>
    );
  }

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskForm.title.trim()) return;

    setIsCreatingTask(true);
    try {
      await createTask({
        title: taskForm.title.trim(),
        description: taskForm.description.trim() || undefined,
        priority: taskForm.priority,
        status: taskForm.status,
        projectId: id,
        dueDate: taskForm.dueDate || undefined,
        startDate: taskForm.startDate || undefined,
        assigneeId: taskForm.assigneeId || undefined,
      });
      toast.success("Task created successfully");
      setIsTaskFormOpen(false);
      setTaskForm({
        title: "",
        description: "",
        priority: "MEDIUM",
        status: "TODO",
        dueDate: "",
        startDate: "",
        assigneeId: "",
      });
    } catch {
      toast.error("Failed to create task");
    } finally {
      setIsCreatingTask(false);
    }
  };

  const handleToggleTask = async (task: any) => {
    const nextStatus = task.status === "DONE" ? "TODO" : "DONE";
    try {
      await updateTask({
        id: task.id,
        data: { status: nextStatus },
      });
      toast.success(`Task marked as ${nextStatus === "DONE" ? "completed" : "incomplete"}`);
    } catch {
      toast.error("Failed to update task");
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm("Are you sure you want to delete this task?")) return;
    try {
      await deleteTask(taskId);
      toast.success("Task deleted");
    } catch {
      toast.error("Failed to delete task");
    }
  };

  const tabs: { id: TabType; label: string; icon: any }[] = [
    { id: "overview", label: "Overview", icon: Building },
    { id: "tasks", label: "Tasks", icon: ListTodo },
    { id: "board", label: "Board", icon: Kanban },
    { id: "timeline", label: "Timeline", icon: Clock },
    { id: "discussions", label: "Discussions", icon: MessageSquare },
  ];

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t: any) => t.status === "DONE").length;
  const taskProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Breadcrumbs & Navigation */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Link href="/projects" className="hover:text-foreground transition-colors font-medium">
          Projects
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-foreground font-semibold truncate max-w-[200px]">{project.name}</span>
      </div>

      {/* Hero Header Card */}
      <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-md">
        <div className="absolute top-0 left-0 w-2 h-full" style={{ backgroundColor: project.color || "#6366f1" }} />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pl-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <span
                className="text-xs font-semibold px-2.5 py-0.5 rounded-full"
                style={{
                  backgroundColor: `${project.color || "#6366f1"}15`,
                  color: project.color || "#6366f1",
                }}
              >
                {project.status}
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">{project.name}</h1>
            {project.description && (
              <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">{project.description}</p>
            )}
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 gap-4 shrink-0 min-w-[240px]">
            <div className="border border-border/60 bg-muted/30 p-3.5 rounded-xl">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Tasks Progress</p>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-xl font-extrabold">{taskProgress}%</span>
                <span className="text-xs text-muted-foreground">({completedTasks}/{totalTasks})</span>
              </div>
            </div>
            <div className="border border-border/60 bg-muted/30 p-3.5 rounded-xl">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Milestones</p>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-xl font-extrabold">
                  {project.milestones?.filter((m: any) => m.completed).length || 0}
                </span>
                <span className="text-xs text-muted-foreground">/{project.milestones?.length || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="flex items-center border-b border-border gap-1 overflow-x-auto pb-px">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold border-b-2 -mb-px transition-all shrink-0 cursor-pointer ${
              activeTab === tab.id
                ? "border-brand-500 text-brand-500"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content Display */}
      <div className="min-h-[400px]">
        {activeTab === "overview" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Overview Metadata Card */}
            <div className="lg:col-span-2 space-y-6">
              <div className="border border-border bg-card p-5 rounded-xl space-y-4">
                <h3 className="text-sm font-bold border-b border-border pb-2">Details</h3>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <span className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Start Date</span>
                    <span className="text-xs font-semibold mt-1 block">
                      {project.startDate ? new Date(project.startDate).toLocaleDateString() : "Not set"}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider">End Date</span>
                    <span className="text-xs font-semibold mt-1 block">
                      {project.endDate ? new Date(project.endDate).toLocaleDateString() : "Not set"}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Budget</span>
                    <span className="text-xs font-semibold mt-1 block text-emerald-500">
                      {project.budget ? `$${project.budget.toLocaleString()}` : "Not set"}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Owner / Creator</span>
                    <span className="text-xs font-semibold mt-1 block">
                      {project.createdBy?.name || "Unknown"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Milestones Card */}
              <div className="border border-border bg-card p-5 rounded-xl space-y-4">
                <h3 className="text-sm font-bold border-b border-border pb-2">Milestones Tracker</h3>
                <MilestoneTracker projectId={id} milestones={project.milestones || []} />
              </div>
            </div>

            {/* Sidebar metadata */}
            <div className="space-y-6">
              {/* Client Card */}
              <div className="border border-border bg-card p-5 rounded-xl space-y-3">
                <h3 className="text-sm font-bold border-b border-border pb-2 flex items-center gap-1">
                  <Building2 className="h-4 w-4 text-brand-500" /> Associated Client
                </h3>
                {project.client ? (
                  <div className="space-y-2">
                    <p className="text-sm font-bold">{project.client.company || "Company Name"}</p>
                    <p className="text-xs text-muted-foreground font-medium">{project.client.name}</p>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground italic">No client linked to this project.</p>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === "tasks" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold">Tasks List ({tasks.length})</h3>
              <button
                onClick={() => setIsTaskFormOpen(true)}
                className="flex items-center gap-1.5 rounded-lg bg-brand-500 px-3.5 py-1.5 text-xs font-semibold text-white shadow-md hover:bg-brand-600 transition-all cursor-pointer"
              >
                <Plus className="h-4 w-4" /> Add Task
              </button>
            </div>

            {/* Tasks list */}
            {isLoadingTasks ? (
              <div className="flex flex-col items-center justify-center py-20 gap-2">
                <Loader2 className="h-6 w-6 animate-spin text-brand-500" />
                <p className="text-xs text-muted-foreground">Loading tasks...</p>
              </div>
            ) : tasks.length === 0 ? (
              <div className="text-center py-16 border border-dashed rounded-xl bg-card">
                <p className="text-sm text-muted-foreground">No tasks assigned to this project yet.</p>
              </div>
            ) : (
              <div className="rounded-xl border border-border bg-card overflow-hidden divide-y divide-border/60">
                {tasks.map((task: any) => (
                  <div key={task.id} className="flex items-center gap-4 px-4 py-3 hover:bg-muted/20 transition-colors group">
                    <button onClick={() => handleToggleTask(task)} className="shrink-0 cursor-pointer">
                      {task.status === "DONE" ? (
                        <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                      ) : (
                        <div className="h-5 w-5 rounded-full border-2 border-muted-foreground/30 hover:border-brand-500" />
                      )}
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className={cn("text-xs font-semibold", task.status === "DONE" && "line-through text-muted-foreground")}>
                        {task.title}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        {task.description && (
                          <p className="text-[10px] text-muted-foreground truncate max-w-[250px]">{task.description}</p>
                        )}
                        {task.assignee && (
                          <span className="text-[9px] text-muted-foreground/80">
                            · Assigned: {task.assignee.name}
                          </span>
                        )}
                      </div>
                    </div>
                    {task.assignee && (
                      <div className="h-5 w-5 rounded-full bg-brand-500/10 text-brand-500 flex items-center justify-center font-bold text-[9px] shrink-0 select-none" title={`Assigned to ${task.assignee.name}`}>
                        {task.assignee.name[0].toUpperCase()}
                      </div>
                    )}
                    <span
                      className="text-[9px] font-bold px-2 py-0.5 rounded"
                      style={{
                        backgroundColor: `${
                          task.priority === "URGENT"
                            ? "#ef4444"
                            : task.priority === "HIGH"
                            ? "#f97316"
                            : task.priority === "MEDIUM"
                            ? "#eab308"
                            : "#3b82f6"
                        }15`,
                        color:
                          task.priority === "URGENT"
                            ? "#ef4444"
                            : task.priority === "HIGH"
                            ? "#f97316"
                            : task.priority === "MEDIUM"
                            ? "#eab308"
                            : "#3b82f6",
                      }}
                    >
                      {task.priority}
                    </span>
                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded-md text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {activeTab === "board" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <KanbanBoard projectId={id} />
          </motion.div>
        )}

        {activeTab === "timeline" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <TimelineChart tasks={tasks} milestones={project.milestones || []} />
          </motion.div>
        )}

        {activeTab === "discussions" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="border border-border bg-card p-5 rounded-xl">
            <CommentSection entityType="project" entityId={id} />
          </motion.div>
        )}
      </div>

      {/* Task Creation Sheet Modal */}
      <AnimatePresence>
        {isTaskFormOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsTaskFormOpen(false)}
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
                <h3 className="text-base font-bold">New Task</h3>
                <button
                  onClick={() => setIsTaskFormOpen(false)}
                  className="p-1 rounded hover:bg-accent text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  &times;
                </button>
              </div>

              <form onSubmit={handleCreateTask} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold mb-1 text-muted-foreground">Task Title</label>
                  <input
                    type="text"
                    required
                    value={taskForm.title}
                    onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                    className="flex h-9 w-full rounded-lg border border-input bg-background px-3 py-1 text-xs"
                    placeholder="e.g. Complete wireframes"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1 text-muted-foreground">Description</label>
                  <textarea
                    value={taskForm.description}
                    onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                    className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-xs"
                    placeholder="Provide description of task..."
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold mb-1 text-muted-foreground">Priority</label>
                    <select
                      value={taskForm.priority}
                      onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value as any })}
                      className="flex h-9 w-full rounded-lg border border-input bg-background px-2 text-xs"
                    >
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                      <option value="URGENT">Urgent</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1 text-muted-foreground">Status</label>
                    <select
                      value={taskForm.status}
                      onChange={(e) => setTaskForm({ ...taskForm, status: e.target.value as any })}
                      className="flex h-9 w-full rounded-lg border border-input bg-background px-2 text-xs"
                    >
                      <option value="BACKLOG">Backlog</option>
                      <option value="TODO">To Do</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="IN_REVIEW">In Review</option>
                      <option value="DONE">Done</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold mb-1 text-muted-foreground">Start Date</label>
                    <input
                      type="date"
                      value={taskForm.startDate}
                      onChange={(e) => setTaskForm({ ...taskForm, startDate: e.target.value })}
                      className="flex h-9 w-full rounded-lg border border-input bg-background px-3 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1 text-muted-foreground">Due Date</label>
                    <input
                      type="date"
                      value={taskForm.dueDate}
                      onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
                      className="flex h-9 w-full rounded-lg border border-input bg-background px-3 text-xs"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1 text-muted-foreground">Assignee</label>
                  <select
                    value={taskForm.assigneeId}
                    onChange={(e) => setTaskForm({ ...taskForm, assigneeId: e.target.value })}
                    className="flex h-9 w-full rounded-lg border border-input bg-background px-2 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors"
                  >
                    <option value="">Unassigned</option>
                    {members.map((member: any) => (
                      <option key={member.user?.id} value={member.user?.id}>
                        {member.user?.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="pt-4 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsTaskFormOpen(false)}
                    className="flex-1 rounded-lg border border-input py-2 text-xs font-semibold hover:bg-accent cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isCreatingTask || !taskForm.title.trim()}
                    className="flex-1 rounded-lg bg-brand-500 text-white py-2 text-xs font-semibold hover:bg-brand-600 disabled:opacity-50 transition-all cursor-pointer flex items-center justify-center gap-1"
                  >
                    {isCreatingTask && <Loader2 className="h-3 w-3 animate-spin" />}
                    Save Task
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

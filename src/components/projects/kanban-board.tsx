"use client";

import { useState } from "react";
import { Task } from "@prisma/client";
import { useTasks } from "@/hooks/queries/use-tasks";
import { motion } from "framer-motion";
import { TASK_STATUS_LABELS, TASK_PRIORITY_LABELS, TASK_PRIORITY_COLORS } from "@/lib/constants";
import { Calendar, User, ClipboardList, Trash2, ArrowRight } from "lucide-react";
import { toast } from "sonner";

interface KanbanBoardProps {
  projectId: string;
}

const COLUMNS: { id: Task["status"]; label: string; bg: string }[] = [
  { id: "BACKLOG", label: "Backlog", bg: "bg-slate-500/5" },
  { id: "TODO", label: "To Do", bg: "bg-blue-500/5" },
  { id: "IN_PROGRESS", label: "In Progress", bg: "bg-amber-500/5" },
  { id: "IN_REVIEW", label: "In Review", bg: "bg-purple-500/5" },
  { id: "DONE", label: "Done", bg: "bg-emerald-500/5" },
];

export function KanbanBoard({ projectId }: KanbanBoardProps) {
  const { tasks, updateTask, deleteTask } = useTasks(projectId);
  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const [activeDragColumn, setActiveDragColumn] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData("text/plain", id);
    setActiveDragId(id);
  };

  const handleDragEnd = () => {
    setActiveDragId(null);
    setActiveDragColumn(null);
  };

  const handleDragOver = (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    setActiveDragColumn(columnId);
  };

  const handleDrop = async (e: React.DragEvent, targetStatus: Task["status"]) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData("text/plain");
    if (!taskId) return;

    // Find the task and update status if different
    const task = tasks.find((t: any) => t.id === taskId);
    if (task && task.status !== targetStatus) {
      try {
        await updateTask({
          id: taskId,
          data: { status: targetStatus },
        });
        toast.success(`Task moved to ${TASK_STATUS_LABELS[targetStatus]}`);
      } catch {
        toast.error("Failed to move task");
      }
    }
    handleDragEnd();
  };

  const handleDeleteTask = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this task?")) return;
    try {
      await deleteTask(id);
      toast.success("Task deleted");
    } catch {
      toast.error("Failed to delete task");
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 overflow-x-auto pb-4">
      {COLUMNS.map((column) => {
        const columnTasks = tasks.filter((t: any) => t.status === column.id);

        return (
          <div
            key={column.id}
            onDragOver={(e) => handleDragOver(e, column.id)}
            onDragLeave={() => setActiveDragColumn(null)}
            onDrop={(e) => handleDrop(e, column.id)}
            className={`rounded-xl border border-border p-3 flex flex-col min-h-[500px] transition-colors ${column.bg} ${
              activeDragColumn === column.id ? "ring-2 ring-brand-500/50" : ""
            }`}
          >
            {/* Column Header */}
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-border/60">
              <span className="text-xs font-bold tracking-wider uppercase text-muted-foreground">
                {column.label}
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                {columnTasks.length}
              </span>
            </div>

            {/* Task list container */}
            <div className="flex-1 space-y-3 overflow-y-auto max-h-[600px] pr-1">
              {columnTasks.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 border border-dashed rounded-lg border-border/40 text-center bg-card/20 select-none">
                  <ClipboardList className="h-6 w-6 text-muted-foreground/30 mb-1" />
                  <p className="text-[10px] text-muted-foreground/50">Drag tasks here</p>
                </div>
              ) : (
                columnTasks.map((task: any) => (
                  <motion.div
                    key={task.id}
                    layout
                    draggable
                    onDragStart={(e) => handleDragStart(e as any, task.id)}
                    onDragEnd={handleDragEnd}
                    className={`p-3.5 rounded-lg border border-border bg-card shadow-sm cursor-grab active:cursor-grabbing hover:border-brand-500/40 transition-all group relative ${
                      activeDragId === task.id ? "opacity-40" : ""
                    }`}
                  >
                    <div className="flex justify-between items-start gap-2 mb-2">
                      <span
                        className="text-[9px] font-bold px-1.5 py-0.5 rounded"
                        style={{
                          backgroundColor: `${TASK_PRIORITY_COLORS[task.priority]}15`,
                          color: TASK_PRIORITY_COLORS[task.priority],
                        }}
                      >
                        {TASK_PRIORITY_LABELS[task.priority]}
                      </span>
                      <button
                        onClick={(e) => handleDeleteTask(task.id, e)}
                        className="opacity-0 group-hover:opacity-100 p-1 rounded-md text-red-500 hover:bg-red-500/10 transition-all cursor-pointer shrink-0"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>

                    <h4 className="text-xs font-semibold leading-snug text-foreground mb-3 break-words">
                      {task.title}
                    </h4>

                    {task.description && (
                      <p className="text-[11px] text-muted-foreground line-clamp-2 mb-3">
                        {task.description}
                      </p>
                    )}

                    <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-2.5 border-t border-border/40">
                      <div className="flex items-center gap-1.5 max-w-[70%]">
                        <div className="h-4.5 w-4.5 rounded-full bg-brand-500/10 text-brand-500 flex items-center justify-center font-bold text-[8px] select-none shrink-0">
                          {task.assignee?.name?.[0]?.toUpperCase() || <User className="h-2 w-2" />}
                        </div>
                        <span className="truncate">{task.assignee?.name || "Unassigned"}</span>
                      </div>

                      {task.dueDate && (
                        <div className="flex items-center gap-1 text-[9px] bg-muted/60 px-1.5 py-0.5 rounded shrink-0">
                          <Calendar className="h-2.5 w-2.5" />
                          {new Date(task.dueDate).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

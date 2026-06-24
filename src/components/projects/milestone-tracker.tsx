"use client";

import { useState } from "react";
import { Milestone } from "@prisma/client";
import { CheckSquare, Square, Calendar, Plus, Trash2, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";

interface MilestoneTrackerProps {
  projectId: string;
  milestones: Milestone[];
}

export function MilestoneTracker({ projectId, milestones }: MilestoneTrackerProps) {
  const queryClient = useQueryClient();
  const [isAdding, setIsAdding] = useState(false);
  const [newMilestoneName, setNewMilestoneName] = useState("");
  const [newMilestoneDueDate, setNewMilestoneDueDate] = useState("");
  const [newMilestoneDesc, setNewMilestoneDesc] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const completedCount = milestones.filter((m) => m.completed).length;
  const progressPercent = milestones.length > 0 ? Math.round((completedCount / milestones.length) * 100) : 0;

  const handleToggleComplete = async (milestone: Milestone) => {
    const nextStatus = !milestone.completed;
    try {
      const res = await fetch(`/api/v1/milestones/${milestone.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: nextStatus }),
      });
      if (!res.ok) throw new Error();
      toast.success(`Milestone marked as ${nextStatus ? "completed" : "incomplete"}`);
      queryClient.invalidateQueries({ queryKey: ["projects", projectId] });
    } catch {
      toast.error("Failed to update milestone");
    }
  };

  const handleAddMilestone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMilestoneName.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/v1/milestones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newMilestoneName.trim(),
          description: newMilestoneDesc.trim() || undefined,
          dueDate: newMilestoneDueDate || undefined,
          projectId,
        }),
      });

      if (!res.ok) throw new Error();
      toast.success("Milestone added successfully");
      setNewMilestoneName("");
      setNewMilestoneDueDate("");
      setNewMilestoneDesc("");
      setIsAdding(false);
      queryClient.invalidateQueries({ queryKey: ["projects", projectId] });
    } catch {
      toast.error("Failed to create milestone");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteMilestone = async (id: string) => {
    if (!confirm("Are you sure you want to delete this milestone?")) return;
    try {
      const res = await fetch(`/api/v1/milestones/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error();
      toast.success("Milestone deleted");
      queryClient.invalidateQueries({ queryKey: ["projects", projectId] });
    } catch {
      toast.error("Failed to delete milestone");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border border-border bg-card p-4 rounded-xl">
        <div className="flex-1">
          <div className="flex justify-between text-xs font-semibold mb-1">
            <span className="text-muted-foreground">Milestones Progress</span>
            <span className="text-brand-500">{progressPercent}% ({completedCount}/{milestones.length})</span>
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              className="h-full rounded-full bg-brand-500"
            />
          </div>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-1.5 rounded-lg bg-brand-500/10 text-brand-500 px-3.5 py-1.5 text-xs font-semibold hover:bg-brand-500 hover:text-white transition-all cursor-pointer self-start sm:self-center shrink-0"
        >
          <Plus className="h-3.5 w-3.5" />
          Add Milestone
        </button>
      </div>

      {/* Add Form */}
      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="border border-border p-4 rounded-xl bg-card/50"
          >
            <form onSubmit={handleAddMilestone} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1 text-muted-foreground">Milestone Name</label>
                  <input
                    type="text"
                    required
                    value={newMilestoneName}
                    onChange={(e) => setNewMilestoneName(e.target.value)}
                    className="flex h-9 w-full rounded-lg border border-input bg-background px-3 py-1 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    placeholder="e.g. Beta release"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1 text-muted-foreground">Due Date</label>
                  <input
                    type="date"
                    value={newMilestoneDueDate}
                    onChange={(e) => setNewMilestoneDueDate(e.target.value)}
                    className="flex h-9 w-full rounded-lg border border-input bg-background px-3 py-1 text-xs focus-visible:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1 text-muted-foreground">Description (Optional)</label>
                <textarea
                  value={newMilestoneDesc}
                  onChange={(e) => setNewMilestoneDesc(e.target.value)}
                  className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-xs focus-visible:outline-none"
                  placeholder="Target details, conditions, deliverables..."
                  rows={2}
                />
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="px-3 py-1.5 rounded-lg border border-input bg-background text-xs hover:bg-accent cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !newMilestoneName.trim()}
                  className="px-3.5 py-1.5 rounded-lg bg-brand-500 text-white text-xs font-semibold hover:bg-brand-600 cursor-pointer flex items-center gap-1"
                >
                  {isSubmitting && <Loader2 className="h-3 w-3 animate-spin" />}
                  Save Milestone
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* List */}
      {milestones.length === 0 ? (
        <div className="text-center py-12 border border-dashed rounded-xl bg-card">
          <p className="text-sm text-muted-foreground">No milestones created yet.</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {milestones.map((milestone) => (
            <motion.div
              key={milestone.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-4 border border-border bg-card p-3 rounded-xl hover:bg-card/75 transition-colors group"
            >
              <button
                onClick={() => handleToggleComplete(milestone)}
                className="shrink-0 cursor-pointer text-muted-foreground hover:text-brand-500 transition-colors"
              >
                {milestone.completed ? (
                  <CheckSquare className="h-5 w-5 text-emerald-500" />
                ) : (
                  <Square className="h-5 w-5" />
                )}
              </button>

              <div className="flex-1 min-w-0">
                <p className={cn("text-sm font-semibold", milestone.completed && "line-through text-muted-foreground")}>
                  {milestone.name}
                </p>
                {milestone.description && (
                  <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{milestone.description}</p>
                )}
              </div>

              {milestone.dueDate && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0 bg-muted/50 px-2 py-1 rounded-md">
                  <Calendar className="h-3 w-3" />
                  {new Date(milestone.dueDate).toLocaleDateString()}
                </div>
              )}

              <button
                onClick={() => handleDeleteMilestone(milestone.id)}
                className="opacity-0 group-hover:opacity-100 p-1.5 rounded-md text-red-500 hover:bg-red-500/10 transition-all cursor-pointer shrink-0"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

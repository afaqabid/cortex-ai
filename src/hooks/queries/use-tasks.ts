"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CreateTaskInput, UpdateTaskInput } from "@/lib/validators/projects";

export function useTasks(projectId?: string) {
  const queryClient = useQueryClient();

  const tasksQuery = useQuery({
    queryKey: projectId ? ["tasks", { projectId }] : ["tasks"],
    queryFn: async () => {
      const url = projectId ? `/api/v1/tasks?projectId=${projectId}` : "/api/v1/tasks";
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch tasks");
      return res.json();
    },
  });

  const createTaskMutation = useMutation({
    mutationFn: async (data: CreateTaskInput) => {
      const res = await fetch("/api/v1/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create task");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      if (projectId) {
        queryClient.invalidateQueries({ queryKey: ["projects", projectId] });
      }
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateTaskInput }) => {
      const res = await fetch(`/api/v1/tasks/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update task");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      if (projectId) {
        queryClient.invalidateQueries({ queryKey: ["projects", projectId] });
      }
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/v1/tasks/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete task");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      if (projectId) {
        queryClient.invalidateQueries({ queryKey: ["projects", projectId] });
      }
    },
  });

  return {
    tasks: tasksQuery.data || [],
    isLoadingTasks: tasksQuery.isLoading,
    tasksError: tasksQuery.error,
    createTask: createTaskMutation.mutateAsync,
    isCreatingTask: createTaskMutation.isPending,
    updateTask: updateTaskMutation.mutateAsync,
    isUpdatingTask: updateTaskMutation.isPending,
    deleteTask: deleteTaskMutation.mutateAsync,
    isDeletingTask: deleteTaskMutation.isPending,
  };
}

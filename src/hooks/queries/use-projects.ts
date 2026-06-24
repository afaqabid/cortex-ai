"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CreateProjectInput, UpdateProjectInput } from "@/lib/validators/projects";

export function useProjects() {
  const queryClient = useQueryClient();

  const projectsQuery = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const res = await fetch("/api/v1/projects");
      if (!res.ok) throw new Error("Failed to fetch projects");
      return res.json();
    },
  });

  const getProjectQuery = (id: string) =>
    useQuery({
      queryKey: ["projects", id],
      queryFn: async () => {
        const res = await fetch(`/api/v1/projects/${id}`);
        if (!res.ok) throw new Error("Failed to fetch project");
        return res.json();
      },
      enabled: !!id,
    });

  const createProjectMutation = useMutation({
    mutationFn: async (data: CreateProjectInput) => {
      const res = await fetch("/api/v1/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create project");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });

  const updateProjectMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateProjectInput }) => {
      const res = await fetch(`/api/v1/projects/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update project");
      return res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["projects", variables.id] });
    },
  });

  const deleteProjectMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/v1/projects/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete project");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });

  return {
    projects: projectsQuery.data || [],
    isLoadingProjects: projectsQuery.isLoading,
    projectsError: projectsQuery.error,
    getProjectQuery,
    createProject: createProjectMutation.mutateAsync,
    isCreatingProject: createProjectMutation.isPending,
    updateProject: updateProjectMutation.mutateAsync,
    isUpdatingProject: updateProjectMutation.isPending,
    deleteProject: deleteProjectMutation.mutateAsync,
    isDeletingProject: deleteProjectMutation.isPending,
  };
}

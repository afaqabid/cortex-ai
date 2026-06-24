"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CreateLeadInput, UpdateLeadInput } from "@/lib/validators/crm";

export function useLeads() {
  const queryClient = useQueryClient();

  const leadsQuery = useQuery({
    queryKey: ["leads"],
    queryFn: async () => {
      const res = await fetch("/api/v1/crm/leads");
      if (!res.ok) throw new Error("Failed to fetch leads");
      return res.json();
    },
  });

  const leadQuery = (id: string) =>
    useQuery({
      queryKey: ["leads", id],
      queryFn: async () => {
        const res = await fetch(`/api/v1/crm/leads/${id}`);
        if (!res.ok) throw new Error("Failed to fetch lead");
        return res.json();
      },
      enabled: !!id,
    });

  const pipelineQuery = useQuery({
    queryKey: ["pipeline"],
    queryFn: async () => {
      const res = await fetch("/api/v1/crm/pipelines");
      if (!res.ok) throw new Error("Failed to fetch pipeline");
      return res.json();
    },
  });

  const createLeadMutation = useMutation({
    mutationFn: async (data: CreateLeadInput) => {
      const res = await fetch("/api/v1/crm/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create lead");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      queryClient.invalidateQueries({ queryKey: ["pipeline"] });
    },
  });

  const updateLeadMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateLeadInput }) => {
      const res = await fetch(`/api/v1/crm/leads/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update lead");
      return res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      queryClient.invalidateQueries({ queryKey: ["leads", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["pipeline"] });
    },
  });

  const deleteLeadMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/v1/crm/leads/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete lead");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      queryClient.invalidateQueries({ queryKey: ["pipeline"] });
    },
  });

  const updateLeadStageMutation = useMutation({
    mutationFn: async ({ leadId, stageId }: { leadId: string; stageId: string }) => {
      const res = await fetch("/api/v1/crm/pipelines", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadId, stageId }),
      });
      if (!res.ok) throw new Error("Failed to update lead stage");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      queryClient.invalidateQueries({ queryKey: ["pipeline"] });
    },
  });

  return {
    leads: leadsQuery.data || [],
    isLoadingLeads: leadsQuery.isLoading,
    leadsError: leadsQuery.error,
    getLeadQuery: leadQuery,
    pipeline: pipelineQuery.data || null,
    isLoadingPipeline: pipelineQuery.isLoading,
    pipelineError: pipelineQuery.error,
    createLead: createLeadMutation.mutateAsync,
    isCreatingLead: createLeadMutation.isPending,
    updateLead: updateLeadMutation.mutateAsync,
    isUpdatingLead: updateLeadMutation.isPending,
    deleteLead: deleteLeadMutation.mutateAsync,
    isDeletingLead: deleteLeadMutation.isPending,
    updateLeadStage: updateLeadStageMutation.mutateAsync,
    isUpdatingLeadStage: updateLeadStageMutation.isPending,
  };
}

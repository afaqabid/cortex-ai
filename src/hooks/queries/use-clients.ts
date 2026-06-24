"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface CreateClientInput {
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  address?: string;
}

export function useClients() {
  const queryClient = useQueryClient();

  const clientsQuery = useQuery({
    queryKey: ["clients"],
    queryFn: async () => {
      const res = await fetch("/api/v1/clients");
      if (!res.ok) throw new Error("Failed to fetch clients");
      return res.json();
    },
  });

  const createClientMutation = useMutation({
    mutationFn: async (data: CreateClientInput) => {
      const res = await fetch("/api/v1/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create client");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
    },
  });

  return {
    clients: clientsQuery.data || [],
    isLoadingClients: clientsQuery.isLoading,
    clientsError: clientsQuery.error,
    createClient: createClientMutation.mutateAsync,
    isCreatingClient: createClientMutation.isPending,
  };
}

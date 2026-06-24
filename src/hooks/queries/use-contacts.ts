"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CreateContactInput } from "@/lib/validators/crm";

export function useContacts() {
  const queryClient = useQueryClient();

  const contactsQuery = useQuery({
    queryKey: ["contacts"],
    queryFn: async () => {
      const res = await fetch("/api/v1/crm/contacts");
      if (!res.ok) throw new Error("Failed to fetch contacts");
      return res.json();
    },
  });

  const createContactMutation = useMutation({
    mutationFn: async (data: CreateContactInput) => {
      const res = await fetch("/api/v1/crm/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create contact");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
    },
  });

  return {
    contacts: contactsQuery.data || [],
    isLoadingContacts: contactsQuery.isLoading,
    contactsError: contactsQuery.error,
    createContact: createContactMutation.mutateAsync,
    isCreatingContact: createContactMutation.isPending,
  };
}

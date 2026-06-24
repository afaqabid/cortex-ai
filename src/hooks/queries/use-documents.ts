"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface CreateDocumentInput {
  title: string;
  content?: string;
  categoryId?: string | null;
  isPublished?: boolean;
}

interface UpdateDocumentInput {
  title?: string;
  content?: string;
  categoryId?: string | null;
  isPublished?: boolean;
}

export function useDocuments(categoryId?: string, search?: string) {
  const queryClient = useQueryClient();

  const documentsQuery = useQuery({
    queryKey: ["documents", { categoryId, search }],
    queryFn: async () => {
      let url = "/api/v1/documents";
      const params = new URLSearchParams();
      if (categoryId) params.append("categoryId", categoryId);
      if (search) params.append("search", search);
      if (params.toString()) url += `?${params.toString()}`;

      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch documents");
      return res.json();
    },
  });

  const createDocumentMutation = useMutation({
    mutationFn: async (data: CreateDocumentInput) => {
      const res = await fetch("/api/v1/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create document");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
    },
  });

  // Categories queries
  const categoriesQuery = useQuery({
    queryKey: ["document-categories"],
    queryFn: async () => {
      const res = await fetch("/api/v1/documents/categories");
      if (!res.ok) throw new Error("Failed to fetch categories");
      return res.json();
    },
  });

  const createCategoryMutation = useMutation({
    mutationFn: async (data: { name: string; color?: string }) => {
      const res = await fetch("/api/v1/documents/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create category");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["document-categories"] });
    },
  });

  return {
    documents: documentsQuery.data || [],
    isLoadingDocuments: documentsQuery.isLoading,
    documentsError: documentsQuery.error,
    createDocument: createDocumentMutation.mutateAsync,
    isCreatingDocument: createDocumentMutation.isPending,
    categories: categoriesQuery.data || [],
    isLoadingCategories: categoriesQuery.isLoading,
    createCategory: createCategoryMutation.mutateAsync,
    isCreatingCategory: createCategoryMutation.isPending,
  };
}

export function useDocumentDetails(id: string) {
  const queryClient = useQueryClient();

  const documentQuery = useQuery({
    queryKey: ["documents", id],
    queryFn: async () => {
      const res = await fetch(`/api/v1/documents/${id}`);
      if (!res.ok) throw new Error("Failed to fetch document details");
      return res.json();
    },
    enabled: !!id,
  });

  const updateDocumentMutation = useMutation({
    mutationFn: async (data: UpdateDocumentInput) => {
      const res = await fetch(`/api/v1/documents/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update document");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      queryClient.invalidateQueries({ queryKey: ["documents", id] });
    },
  });

  const deleteDocumentMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/v1/documents/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete document");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
    },
  });

  return {
    document: documentQuery.data,
    isLoadingDocument: documentQuery.isLoading,
    documentError: documentQuery.error,
    updateDocument: updateDocumentMutation.mutateAsync,
    isUpdatingDocument: updateDocumentMutation.isPending,
    deleteDocument: deleteDocumentMutation.mutateAsync,
    isDeletingDocument: deleteDocumentMutation.isPending,
  };
}

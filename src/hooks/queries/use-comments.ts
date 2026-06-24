"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface CreateCommentInput {
  entityType: "project" | "task" | "lead" | "document";
  entityId: string;
  content: string;
  parentId?: string;
}

export function useComments(
  entityType: "project" | "task" | "lead" | "document",
  entityId: string
) {
  const queryClient = useQueryClient();
  const queryKey = ["comments", entityType, entityId];

  const commentsQuery = useQuery({
    queryKey,
    queryFn: async () => {
      const res = await fetch(
        `/api/v1/comments?entityType=${entityType}&entityId=${entityId}`
      );
      if (!res.ok) throw new Error("Failed to fetch comments");
      return res.json();
    },
    enabled: !!entityType && !!entityId,
  });

  const createCommentMutation = useMutation({
    mutationFn: async (data: CreateCommentInput) => {
      const res = await fetch("/api/v1/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create comment");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  const deleteCommentMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/v1/comments/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete comment");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  return {
    comments: commentsQuery.data || [],
    isLoadingComments: commentsQuery.isLoading,
    commentsError: commentsQuery.error,
    createComment: createCommentMutation.mutateAsync,
    isCreatingComment: createCommentMutation.isPending,
    deleteComment: deleteCommentMutation.mutateAsync,
    isDeletingComment: deleteCommentMutation.isPending,
  };
}

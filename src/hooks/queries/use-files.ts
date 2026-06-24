"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export function useFiles(folderId: string | null = null) {
  const queryClient = useQueryClient();

  const filesQuery = useQuery({
    queryKey: ["files", { folderId }],
    queryFn: async () => {
      let url = "/api/v1/files";
      if (folderId) {
        url += `?folderId=${folderId}`;
      }
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch files");
      return res.json();
    },
  });

  const foldersQuery = useQuery({
    queryKey: ["folders", { parentId: folderId }],
    queryFn: async () => {
      let url = "/api/v1/folders";
      if (folderId) {
        url += `?parentId=${folderId}`;
      }
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch folders");
      return res.json();
    },
  });

  const createFolderMutation = useMutation({
    mutationFn: async (data: { name: string; parentId: string | null }) => {
      const res = await fetch("/api/v1/folders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create folder");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["folders"] });
    },
  });

  const uploadFileMutation = useMutation({
    mutationFn: async (data: { file: File; folderId: string | null }) => {
      const formData = new FormData();
      formData.append("file", data.file);
      if (data.folderId) {
        formData.append("folderId", data.folderId);
      }

      const res = await fetch("/api/v1/files", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("Failed to upload file");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["files"] });
    },
  });

  const deleteFileMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/v1/files/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete file");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["files"] });
    },
  });

  const deleteFolderMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/v1/folders/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete folder");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["folders"] });
    },
  });

  return {
    files: filesQuery.data || [],
    folders: foldersQuery.data || [],
    isLoadingFiles: filesQuery.isLoading,
    isLoadingFolders: foldersQuery.isLoading,
    filesError: filesQuery.error,
    foldersError: foldersQuery.error,
    createFolder: createFolderMutation.mutateAsync,
    isCreatingFolder: createFolderMutation.isPending,
    uploadFile: uploadFileMutation.mutateAsync,
    isUploadingFile: uploadFileMutation.isPending,
    deleteFile: deleteFileMutation.mutateAsync,
    isDeletingFile: deleteFileMutation.isPending,
    deleteFolder: deleteFolderMutation.mutateAsync,
    isDeletingFolder: deleteFolderMutation.isPending,
  };
}

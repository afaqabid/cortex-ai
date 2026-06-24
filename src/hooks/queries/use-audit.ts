"use client";

import { useQuery } from "@tanstack/react-query";

export function useAuditLogs() {
  const auditQuery = useQuery({
    queryKey: ["audit-logs"],
    queryFn: async () => {
      const res = await fetch("/api/v1/audit-logs");
      if (!res.ok) throw new Error("Failed to fetch audit logs");
      return res.json();
    },
  });

  return {
    logs: auditQuery.data || [],
    isLoadingLogs: auditQuery.isLoading,
    error: auditQuery.error,
  };
}

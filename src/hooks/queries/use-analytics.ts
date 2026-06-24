"use client";

import { useQuery } from "@tanstack/react-query";

export function useAnalytics() {
  const analyticsQuery = useQuery({
    queryKey: ["analytics"],
    queryFn: async () => {
      const res = await fetch("/api/v1/analytics");
      if (!res.ok) throw new Error("Failed to fetch analytics data");
      return res.json();
    },
  });

  return {
    data: analyticsQuery.data,
    isLoading: analyticsQuery.isLoading,
    error: analyticsQuery.error,
  };
}

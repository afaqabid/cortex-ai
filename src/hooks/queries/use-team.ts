"use client";

import { useQuery } from "@tanstack/react-query";

export function useTeam() {
  const teamQuery = useQuery({
    queryKey: ["team"],
    queryFn: async () => {
      const res = await fetch("/api/v1/team");
      if (!res.ok) throw new Error("Failed to fetch team members");
      return res.json();
    },
  });

  return {
    members: teamQuery.data || [],
    isLoadingTeam: teamQuery.isLoading,
    teamError: teamQuery.error,
    refetch: teamQuery.refetch,
  };
}

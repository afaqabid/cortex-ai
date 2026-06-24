"use client";

import { useQuery } from "@tanstack/react-query";

export function useCompanies() {
  const companiesQuery = useQuery({
    queryKey: ["companies"],
    queryFn: async () => {
      const res = await fetch("/api/v1/crm/companies");
      if (!res.ok) throw new Error("Failed to fetch companies");
      return res.json();
    },
  });

  return {
    companies: companiesQuery.data || [],
    isLoadingCompanies: companiesQuery.isLoading,
    companiesError: companiesQuery.error,
  };
}

"use client";

import { motion } from "framer-motion";
import { Building2, Search, Loader2 } from "lucide-react";
import { useState } from "react";
import { useCompanies } from "@/hooks/queries/use-companies";

export default function CompaniesPage() {
  const { companies, isLoadingCompanies } = useCompanies();
  const [search, setSearch] = useState("");

  const filtered = companies.filter((c: any) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Companies</h1>
          <p className="text-muted-foreground mt-1">Manage your client companies</p>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search companies..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex h-9 w-full rounded-lg border border-input bg-background pl-9 pr-4 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors"
        />
      </div>

      {isLoadingCompanies ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
          <p className="text-sm text-muted-foreground">Loading companies...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center border border-dashed rounded-xl p-12 text-center bg-card">
          <Building2 className="h-10 w-10 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold">No companies found</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-sm">
            Companies are automatically aggregated when you associate them with leads or contacts.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((company: any, i: number) => {
            const logo = company.name.split(" ").map((n: string) => n[0]).slice(0, 2).join("");
            return (
              <motion.div
                key={company.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                whileHover={{ y: -2 }}
                className="rounded-xl border border-border bg-card p-5 hover:shadow-lg transition-all cursor-pointer group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-500/10 text-brand-500 font-bold text-sm">
                      {logo}
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{company.name}</p>
                    </div>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-border flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">
                    {company.contactsCount} contacts · {company.leadsCount} leads
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}

"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Mail,
  Phone,
  Building2,
  TrendingUp,
  Eye,
  Pencil,
  Trash2,
  UserPlus,
  ArrowUpDown,
  Loader2,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  LEAD_STATUS_COLORS,
  LEAD_STATUS_LABELS,
  LEAD_SOURCE_LABELS,
} from "@/lib/constants";
import { useLeads } from "@/hooks/queries/use-leads";
import { toast } from "sonner";

function LeadScoreBadge({ score }: { score: number }) {
  const color =
    score >= 80
      ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
      : score >= 50
        ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
        : "bg-slate-500/10 text-slate-400 border-slate-500/20";
  const label = score >= 80 ? "Hot" : score >= 50 ? "Warm" : "Cold";

  return (
    <div className={cn("flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full border", color)}>
      <TrendingUp className="h-3 w-3" />
      <span>{score}</span>
      <span className="opacity-60">· {label}</span>
    </div>
  );
}

export default function LeadsPage() {
  const { leads, isLoadingLeads, createLead, updateLead, deleteLead } = useLeads();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  // Form states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    title: "",
    source: "OTHER" as any,
    value: 0,
    notes: "",
  });

  const handleOpenCreate = () => {
    setEditingLead(null);
    setFormData({
      name: "",
      email: "",
      phone: "",
      company: "",
      title: "",
      source: "OTHER",
      value: 0,
      notes: "",
    });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (lead: any) => {
    setEditingLead(lead);
    setFormData({
      name: lead.name,
      email: lead.email || "",
      phone: lead.phone || "",
      company: lead.company || "",
      title: lead.title || "",
      source: lead.source,
      value: lead.value || 0,
      notes: lead.notes || "",
    });
    setIsFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingLead) {
        await updateLead({
          id: editingLead.id,
          data: formData,
        });
        toast.success("Lead updated successfully");
      } else {
        await createLead(formData);
        toast.success("Lead created successfully");
      }
      setIsFormOpen(false);
    } catch {
      toast.error("Failed to save lead");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this lead?")) return;
    try {
      await deleteLead(id);
      toast.success("Lead deleted successfully");
    } catch {
      toast.error("Failed to delete lead");
    }
  };

  const filteredLeads = leads.filter((lead: any) => {
    const matchesSearch =
      lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (lead.company && lead.company.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (lead.email && lead.email.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = !selectedStatus || lead.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const statusCounts = leads.reduce(
    (acc: Record<string, number>, lead: any) => {
      acc[lead.status] = (acc[lead.status] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Leads</h1>
          <p className="text-muted-foreground mt-1">
            Manage and track your sales leads
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleOpenCreate}
          className="flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-brand-500/25 hover:bg-brand-600 transition-all self-start cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          Add Lead
        </motion.button>
      </div>

      {/* Status filter pills */}
      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={() => setSelectedStatus(null)}
          className={cn(
            "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer",
            !selectedStatus
              ? "bg-brand-500 text-white"
              : "bg-muted text-muted-foreground hover:text-foreground"
          )}
        >
          All ({leads.length})
        </button>
        {Object.entries(LEAD_STATUS_LABELS).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setSelectedStatus(selectedStatus === key ? null : key)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer",
              selectedStatus === key
                ? "bg-brand-500 text-white"
                : "bg-muted text-muted-foreground hover:text-foreground"
            )}
          >
            <div
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: LEAD_STATUS_COLORS[key] }}
            />
            {label} ({statusCounts[key] || 0})
          </button>
        ))}
      </div>

      {/* Search and filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search leads..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex h-9 w-full rounded-lg border border-input bg-background pl-9 pr-4 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors"
          />
        </div>
      </div>

      {/* Leads Table */}
      {isLoadingLeads ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
          <p className="text-sm text-muted-foreground">Loading leads...</p>
        </div>
      ) : filteredLeads.length === 0 ? (
        <div className="flex flex-col items-center justify-center border border-dashed rounded-xl p-12 text-center">
          <Building2 className="h-10 w-10 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold">No leads found</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-sm">
            Get started by adding your first lead to track and manage sales opportunities.
          </p>
          <button
            onClick={handleOpenCreate}
            className="mt-4 flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white shadow-lg hover:bg-brand-600 transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            Add Lead
          </button>
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">
                    Lead
                  </th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3 hidden md:table-cell">
                    Company
                  </th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">
                    Status
                  </th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3 hidden lg:table-cell">
                    Source
                  </th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3 hidden lg:table-cell">
                    Score
                  </th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3 hidden sm:table-cell">
                    Value
                  </th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3 hidden xl:table-cell">
                    Assigned To
                  </th>
                  <th className="text-right text-xs font-medium text-muted-foreground px-4 py-3">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredLeads.map((lead: any, i: number) => (
                  <motion.tr
                    key={lead.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: i * 0.03 }}
                    className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors group"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-500/10 text-brand-500 text-xs font-bold">
                          {lead.name
                            .split(" ")
                            .map((n: string) => n[0])
                            .slice(0, 2)
                            .join("")}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{lead.name}</p>
                          {lead.email && (
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Mail className="h-3 w-3" />
                              <span className="hidden sm:inline">{lead.email}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-sm">{lead.company || "—"}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full"
                        style={{
                          backgroundColor: `${LEAD_STATUS_COLORS[lead.status]}15`,
                          color: LEAD_STATUS_COLORS[lead.status],
                        }}
                      >
                        <div
                          className="h-1.5 w-1.5 rounded-full"
                          style={{
                            backgroundColor: LEAD_STATUS_COLORS[lead.status],
                          }}
                        />
                        {LEAD_STATUS_LABELS[lead.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <span className="text-sm text-muted-foreground">
                        {LEAD_SOURCE_LABELS[lead.source]}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <LeadScoreBadge score={lead.score || 0} />
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className="text-sm font-medium">
                        ${lead.value?.toLocaleString() || 0}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden xl:table-cell">
                      {lead.assignedTo ? (
                        <div className="flex items-center gap-2">
                          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-500/10 text-brand-500 text-[10px] font-bold">
                            {lead.assignedTo.name
                              .split(" ")
                              .map((n: string) => n[0])
                              .join("")}
                          </div>
                          <span className="text-sm">{lead.assignedTo.name}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          Unassigned
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="relative flex justify-end gap-1">
                        <button
                          onClick={() => handleOpenEdit(lead)}
                          className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-all cursor-pointer"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(lead.id)}
                          className="flex h-7 w-7 items-center justify-center rounded-md text-red-500 hover:bg-red-500/10 transition-all cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Side Sheet Form for Create / Edit */}
      <AnimatePresence>
        {isFormOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFormOpen(false)}
              className="fixed inset-0 bg-black z-40"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-card border-l border-border p-6 shadow-2xl z-50 overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold">
                  {editingLead ? "Edit Lead" : "Add Lead"}
                </h3>
                <button
                  onClick={() => setIsFormOpen(false)}
                  className="p-1 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5">Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors"
                    placeholder="Sarah Jenkins"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors"
                    placeholder="sarah@corp.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5">Phone</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors"
                    placeholder="+1 (555) 019-2834"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Company</label>
                    <input
                      type="text"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors"
                      placeholder="Stripe"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Title</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors"
                      placeholder="Account Exec"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Source</label>
                    <select
                      value={formData.source}
                      onChange={(e) => setFormData({ ...formData, source: e.target.value as any })}
                      className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors"
                    >
                      {Object.entries(LEAD_SOURCE_LABELS).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Value ($)</label>
                    <input
                      type="number"
                      value={formData.value}
                      onChange={(e) => setFormData({ ...formData, value: Number(e.target.value) })}
                      className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5">Notes</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={3}
                    className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors"
                    placeholder="Details about client needs..."
                  />
                </div>

                <div className="pt-4 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsFormOpen(false)}
                    className="flex-1 rounded-lg border border-input bg-background py-2 text-sm font-semibold hover:bg-accent transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 rounded-lg bg-brand-500 text-white py-2 text-sm font-semibold shadow-lg hover:bg-brand-600 transition-all cursor-pointer"
                  >
                    Save Lead
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}


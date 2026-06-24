"use client";

import { useState } from "react";
import { useInvoices } from "@/hooks/queries/use-invoices";
import { motion } from "framer-motion";
import { Plus, Search, FileText, CheckCircle2, AlertCircle, Clock, ArrowUpRight, Loader2, ArrowRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { INVOICE_STATUS_LABELS, INVOICE_STATUS_COLORS } from "@/lib/constants";

export default function InvoicesPage() {
  const { invoices, isLoadingInvoices } = useInvoices();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  const filtered = invoices.filter((inv: any) => {
    const matchesSearch =
      inv.number.toLowerCase().includes(search.toLowerCase()) ||
      (inv.client?.company || "").toLowerCase().includes(search.toLowerCase());
    const matchesStatus = !statusFilter || inv.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Calculate stats
  const totalBilled = invoices.reduce((sum: number, inv: any) => sum + (inv.total || 0), 0);
  const totalPaid = invoices
    .filter((inv: any) => inv.status === "PAID")
    .reduce((sum: number, inv: any) => sum + (inv.total || 0), 0);
  const totalOutstanding = totalBilled - totalPaid;

  const getStatusIcon = (status: string) => {
    if (status === "PAID") return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
    if (status === "OVERDUE") return <AlertCircle className="h-4 w-4 text-red-500" />;
    return <Clock className="h-4 w-4 text-amber-500" />;
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Invoices</h1>
          <p className="text-muted-foreground mt-1">
            Generate billings and track outstanding payments for your clients.
          </p>
        </div>
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="self-start">
          <Link
            href="/invoices/new"
            className="flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-brand-500/25 hover:bg-brand-600 transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4" /> New Invoice
          </Link>
        </motion.div>
      </div>

      {/* Summary Boards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Total Invoiced", amount: totalBilled, color: "text-foreground", border: "border-border" },
          { label: "Total Paid", amount: totalPaid, color: "text-emerald-500", border: "border-emerald-500/20 bg-emerald-500/[0.02]" },
          { label: "Total Outstanding", amount: totalOutstanding, color: "text-amber-500", border: "border-amber-500/20 bg-amber-500/[0.02]" },
        ].map((stat, i) => (
          <div key={i} className={cn("border p-5 rounded-2xl bg-card shadow-sm space-y-2", stat.border)}>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{stat.label}</span>
            <p className={cn("text-2xl font-extrabold", stat.color)}>${stat.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
          </div>
        ))}
      </div>

      {/* Filters & Search */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search invoices by number or client..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex h-9 w-full rounded-lg border border-input bg-background pl-9 pr-4 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
        <div className="flex items-center gap-2">
          {["DRAFT", "SENT", "PAID", "OVERDUE"].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(statusFilter === status ? null : status)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5",
                statusFilter === status
                  ? "bg-brand-500 text-white"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              )}
            >
              <div className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: INVOICE_STATUS_COLORS[status] }} />
              {INVOICE_STATUS_LABELS[status]}
            </button>
          ))}
        </div>
      </div>

      {/* List / Table */}
      {isLoadingInvoices ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
          <p className="text-sm text-muted-foreground font-medium">Loading invoices...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center border border-dashed rounded-xl p-12 text-center bg-card">
          <FileText className="h-10 w-10 text-muted-foreground mb-4" />
          <h3 className="text-sm font-semibold">No invoices found</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm">
            Generate billing statements to invoice clients for tasks, projects, or consulting services.
          </p>
          <Link
            href="/invoices/new"
            className="mt-4 flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600 transition-colors"
          >
            <Plus className="h-4 w-4" /> New Invoice
          </Link>
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card overflow-hidden divide-y divide-border/60">
          {filtered.map((inv: any, i: number) => (
            <motion.div
              key={inv.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.02 }}
            >
              <Link
                href={`/invoices/${inv.id}`}
                className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-muted/20 transition-colors group"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="h-9 w-9 rounded-lg bg-brand-500/10 text-brand-500 flex items-center justify-center font-bold text-xs shrink-0 select-none">
                    INV
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold leading-none">{inv.number}</p>
                    <p className="text-xs text-muted-foreground font-medium truncate mt-1">
                      {inv.client?.company || "No Company"} ({inv.client?.name})
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-6 shrink-0">
                  <div className="text-right hidden sm:block">
                    <p className="text-xs font-bold">${inv.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      Due: {new Date(inv.dueDate).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className="text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5"
                      style={{
                        backgroundColor: `${INVOICE_STATUS_COLORS[inv.status]}15`,
                        color: INVOICE_STATUS_COLORS[inv.status],
                      }}
                    >
                      {getStatusIcon(inv.status)}
                      {INVOICE_STATUS_LABELS[inv.status]}
                    </span>
                    <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-1" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

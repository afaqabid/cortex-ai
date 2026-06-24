"use client";

import { motion } from "framer-motion";
import {
  Plus,
  DollarSign,
  Calendar,
  GripVertical,
  Loader2,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { useLeads } from "@/hooks/queries/use-leads";
import { toast } from "sonner";

export default function PipelinesPage() {
  const { pipeline, isLoadingPipeline, updateLeadStage } = useLeads();

  const handleDragStart = (e: any, leadId: string) => {
    e.dataTransfer.setData("text/plain", leadId);
  };

  const handleDrop = async (e: any, stageId: string) => {
    e.preventDefault();
    const leadId = e.dataTransfer.getData("text/plain");
    if (!leadId) return;

    try {
      await updateLeadStage({ leadId, stageId });
      toast.success("Lead stage updated");
    } catch {
      toast.error("Failed to update lead stage");
    }
  };

  const handleDragOver = (e: any) => {
    e.preventDefault();
  };

  if (isLoadingPipeline) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
        <p className="text-sm text-muted-foreground">Loading pipeline...</p>
      </div>
    );
  }

  const stages = pipeline?.stages || [];
  const totalValue = stages.reduce(
    (acc: number, stage: any) =>
      acc + (stage.leads?.reduce((sum: number, lead: any) => sum + (lead.value || 0), 0) || 0),
    0
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="h-full flex flex-col"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Sales Pipeline</h1>
          <p className="text-muted-foreground mt-1">
            Total pipeline value:{" "}
            <span className="font-semibold text-foreground">
              {formatCurrency(totalValue)}
            </span>
          </p>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto pb-4">
        <div className="flex gap-4 h-full min-w-max">
          {stages.map((stage: any, stageIndex: number) => {
            const stageValue =
              stage.leads?.reduce((sum: number, lead: any) => sum + (lead.value || 0), 0) || 0;

            return (
              <div
                key={stage.id}
                className="flex flex-col w-80 shrink-0"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, stage.id)}
              >
                {/* Stage Header */}
                <div className="flex items-center justify-between mb-3 px-1">
                  <div className="flex items-center gap-2">
                    <div
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: stage.color || "#94a3b8" }}
                    />
                    <h3 className="text-sm font-semibold">{stage.name}</h3>
                    <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-muted px-1.5 text-xs font-medium text-muted-foreground">
                      {stage.leads?.length || 0}
                    </span>
                  </div>
                  <span className="text-xs font-medium text-muted-foreground">
                    {formatCurrency(stageValue)}
                  </span>
                </div>

                {/* Stage Column */}
                <div className="flex-1 rounded-xl bg-muted/30 border border-border/50 p-2 space-y-2 min-h-[400px]">
                  {stage.leads && stage.leads.length > 0 ? (
                    stage.leads.map((lead: any, leadIndex: number) => (
                      <div
                        key={lead.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, lead.id)}
                        className="rounded-lg border border-border bg-card p-3.5 cursor-grab active:cursor-grabbing group hover:shadow-sm transition-shadow"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <GripVertical className="h-4 w-4 text-muted-foreground/30 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab" />
                            <p className="text-sm font-medium">{lead.name}</p>
                          </div>
                        </div>
                        {lead.company && (
                          <p className="text-xs text-muted-foreground mt-1 ml-6">
                            {lead.company}
                          </p>
                        )}

                        <div className="flex items-center justify-between mt-3 ml-6">
                          <div className="flex items-center gap-1.5">
                            <DollarSign className="h-3 w-3 text-emerald-500" />
                            <span className="text-xs font-semibold">
                              {formatCurrency(lead.value || 0)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Calendar className="h-3 w-3" />
                              <span>
                                {Math.round(
                                  (Date.now() - new Date(lead.updatedAt).getTime()) /
                                    (1000 * 60 * 60 * 24)
                                )}
                                d
                              </span>
                            </div>
                            <div
                              className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-500/10 text-brand-500 text-[9px] font-bold"
                              title={lead.assignedTo?.name || "Unassigned"}
                            >
                              {lead.assignedTo
                                ? lead.assignedTo.name
                                    .split(" ")
                                    .map((n: string) => n[0])
                                    .join("")
                                : "—"}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="h-24 flex items-center justify-center border border-dashed rounded-lg border-border/40">
                      <p className="text-xs text-muted-foreground">Drag deals here</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}

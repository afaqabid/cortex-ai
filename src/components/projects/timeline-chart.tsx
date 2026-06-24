"use client";

import { Task, Milestone } from "@prisma/client";
import { Calendar, AlertCircle, Compass } from "lucide-react";
import { cn } from "@/lib/utils";

interface TimelineChartProps {
  tasks: Task[];
  milestones: Milestone[];
}

export function TimelineChart({ tasks, milestones }: TimelineChartProps) {
  // Filter tasks with dates
  const datedTasks = tasks.filter((t) => t.startDate || t.dueDate);
  const datedMilestones = milestones.filter((m) => m.dueDate);

  if (datedTasks.length === 0 && datedMilestones.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center border border-dashed rounded-xl p-12 text-center bg-card">
        <Compass className="h-10 w-10 text-muted-foreground mb-4" />
        <h3 className="text-sm font-semibold">No timeline data available</h3>
        <p className="text-xs text-muted-foreground mt-1 max-w-sm">
          Set start dates and due dates on tasks or milestones to visualize them on the timeline.
        </p>
      </div>
    );
  }

  // Get date range bounds
  const allDates: Date[] = [];
  datedTasks.forEach((t) => {
    if (t.startDate) allDates.push(new Date(t.startDate));
    if (t.dueDate) allDates.push(new Date(t.dueDate));
  });
  datedMilestones.forEach((m) => {
    if (m.dueDate) allDates.push(new Date(m.dueDate));
  });

  const minDate = new Date(Math.min(...allDates.map((d) => d.getTime())));
  const maxDate = new Date(Math.max(...allDates.map((d) => d.getTime())));

  // Pad min and max dates by 3 days
  minDate.setDate(minDate.getDate() - 3);
  maxDate.setDate(maxDate.getDate() + 7);

  const totalDays = Math.max(1, Math.round((maxDate.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24)));

  // Generate headers (days / dates)
  const columns: Date[] = [];
  for (let i = 0; i < totalDays; i++) {
    const curDate = new Date(minDate);
    curDate.setDate(minDate.getDate() + i);
    columns.push(curDate);
  }

  const getGridColumnRange = (start?: Date | null, end?: Date | null) => {
    const sDate = start ? new Date(start) : end ? new Date(end) : minDate;
    const eDate = end ? new Date(end) : start ? new Date(start) : maxDate;

    // Calculate grid-start (1-indexed)
    let gridStart = Math.round((sDate.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    if (gridStart < 1) gridStart = 1;

    let gridEnd = Math.round((eDate.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24)) + 2; // +2 to span to next day
    if (gridEnd > totalDays + 1) gridEnd = totalDays + 1;
    if (gridEnd <= gridStart) gridEnd = gridStart + 1;

    return { gridStart, gridEnd };
  };

  return (
    <div className="border border-border bg-card rounded-xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <div className="min-w-[800px] select-none">
          {/* Calendar Header */}
          <div
            className="grid border-b border-border bg-muted/40 text-[10px] font-semibold text-muted-foreground divide-x divide-border/60"
            style={{ gridTemplateColumns: `200px repeat(${totalDays}, 1fr)` }}
          >
            <div className="p-3 font-bold text-foreground">Entities</div>
            {columns.map((date, idx) => (
              <div key={idx} className="p-2 text-center flex flex-col justify-center min-w-[32px]">
                <span>{date.toLocaleDateString(undefined, { weekday: "short" })}</span>
                <span className="font-bold text-foreground mt-0.5">{date.getDate()}</span>
              </div>
            ))}
          </div>

          {/* Rows */}
          <div className="divide-y divide-border/60">
            {/* Milestones Row */}
            {datedMilestones.length > 0 && (
              <div className="relative">
                <div
                  className="grid min-h-[48px] items-center divide-x divide-border/30"
                  style={{ gridTemplateColumns: `200px repeat(${totalDays}, 1fr)` }}
                >
                  <div className="p-3 text-xs font-bold text-muted-foreground flex items-center gap-1">
                    <AlertCircle className="h-3.5 w-3.5 text-brand-500" /> Milestones
                  </div>
                  {columns.map((_, idx) => (
                    <div key={idx} className="h-full bg-card" />
                  ))}
                </div>
                {/* Milestone Markers */}
                <div
                  className="absolute inset-y-0 left-[200px] right-0 grid items-center pointer-events-none"
                  style={{ gridTemplateColumns: `repeat(${totalDays}, 1fr)` }}
                >
                  {datedMilestones.map((m) => {
                    const { gridStart } = getGridColumnRange(m.dueDate, m.dueDate);
                    return (
                      <div
                        key={m.id}
                        className="pointer-events-auto h-full flex flex-col items-center justify-center"
                        style={{ gridColumnStart: gridStart }}
                      >
                        <div
                          className={cn(
                            "h-3.5 w-3.5 rotate-45 border-2 border-background shadow-md cursor-pointer",
                            m.completed ? "bg-emerald-500" : "bg-brand-500"
                          )}
                          title={`${m.name} (Due: ${new Date(m.dueDate!).toLocaleDateString()})`}
                        />
                        <span className="text-[8px] font-bold text-foreground truncate max-w-[80px] mt-1">
                          {m.name}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Tasks Rows */}
            {datedTasks.map((t) => {
              const { gridStart, gridEnd } = getGridColumnRange(t.startDate, t.dueDate);

              return (
                <div key={t.id} className="relative">
                  <div
                    className="grid min-h-[48px] items-center divide-x divide-border/30"
                    style={{ gridTemplateColumns: `200px repeat(${totalDays}, 1fr)` }}
                  >
                    <div className="p-3 text-xs font-medium text-foreground truncate pr-4" title={t.title}>
                      {t.title}
                    </div>
                    {columns.map((_, idx) => (
                      <div key={idx} className="h-full" />
                    ))}
                  </div>

                  {/* Task Bar */}
                  <div
                    className="absolute inset-0 left-[200px] right-0 grid items-center pointer-events-none px-1"
                    style={{ gridTemplateColumns: `repeat(${totalDays}, 1fr)` }}
                  >
                    <div
                      className="pointer-events-auto h-7 rounded-md bg-brand-500/10 border border-brand-500/20 text-[10px] font-semibold text-brand-500 flex items-center px-2 shadow-sm truncate select-none cursor-pointer hover:bg-brand-500/15 transition-colors"
                      style={{ gridColumnStart: gridStart, gridColumnEnd: gridEnd }}
                      title={`${t.title} (${
                        t.startDate ? new Date(t.startDate).toLocaleDateString() : "?"
                      } to ${t.dueDate ? new Date(t.dueDate).toLocaleDateString() : "?"})`}
                    >
                      {t.title}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

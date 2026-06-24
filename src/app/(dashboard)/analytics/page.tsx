"use client";

import { useState, useEffect } from "react";
import { useAnalytics } from "@/hooks/queries/use-analytics";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import {
  DollarSign,
  TrendingUp,
  Briefcase,
  Users,
  Loader2,
} from "lucide-react";

const COLORS = ["#3b82f6", "#10b981", "#ef4444", "#f59e0b", "#6366f1", "#8b5cf6"];

export default function AnalyticsPage() {
  const [mounted, setMounted] = useState(false);
  const { data, isLoading, error } = useAnalytics();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex h-[80vh] flex-col items-center justify-center text-center p-6">
        <h3 className="text-lg font-bold text-red-500">Error Loading Analytics</h3>
        <p className="text-muted-foreground text-sm mt-1">
          Could not retrieve business operational metrics. Please check your connection or try again later.
        </p>
      </div>
    );
  }

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
          Intelligence & Analytics
        </h1>
        <p className="text-muted-foreground text-sm">
          Get real-time insights into invoicing performance, projects load, and CRM conversions.
        </p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Billed */}
        <div className="bg-card border border-border rounded-xl p-5 hover:shadow-md transition-all">
          <div className="flex items-center justify-between pb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Total Billed
            </span>
            <DollarSign className="w-4 h-4 text-blue-500" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {formatCurrency(data.totalInvoiced)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Cumulative invoices total value</p>
          </div>
        </div>

        {/* Total Paid */}
        <div className="bg-card border border-border rounded-xl p-5 hover:shadow-md transition-all">
          <div className="flex items-center justify-between pb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Total Collected
            </span>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {formatCurrency(data.totalPaid)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Paid invoices revenue ({data.totalInvoiced ? Math.round((data.totalPaid / data.totalInvoiced) * 100) : 0}% recovery)
            </p>
          </div>
        </div>

        {/* Pipeline Value */}
        <div className="bg-card border border-border rounded-xl p-5 hover:shadow-md transition-all">
          <div className="flex items-center justify-between pb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Lead Pipeline
            </span>
            <Users className="w-4 h-4 text-purple-500" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {formatCurrency(data.totalLeadValue)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Estimated deals value from {data.totalLeads} active leads
            </p>
          </div>
        </div>

        {/* Active Workload */}
        <div className="bg-card border border-border rounded-xl p-5 hover:shadow-md transition-all">
          <div className="flex items-center justify-between pb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Active Projects
            </span>
            <Briefcase className="w-4 h-4 text-amber-500" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {data.totalProjects}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Projects registered in workspace
            </p>
          </div>
        </div>
      </div>

      {/* Main Charts Row */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Revenue Area Chart */}
        <div className="lg:col-span-2 bg-card border border-border rounded-xl p-5">
          <div className="mb-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Revenue & Collections Over Time</h2>
            <p className="text-xs text-muted-foreground">Billed invoicing totals vs actual collected amounts</p>
          </div>
          <div className="h-80">
            {data.revenueChartData.length === 0 ? (
              <div className="flex h-full items-center justify-center text-muted-foreground text-sm">
                No billing history found to show trends.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.revenueChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorBilled" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorPaid" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-800" />
                  <XAxis dataKey="name" stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888888" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(255, 255, 255, 0.95)",
                      borderRadius: "8px",
                      border: "none",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                      color: "#1e293b",
                    }}
                    formatter={(value: any) => [formatCurrency(value), undefined]}
                  />
                  <Legend verticalAlign="top" height={36} />
                  <Area
                    type="monotone"
                    name="Billed"
                    dataKey="billed"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorBilled)"
                  />
                  <Area
                    type="monotone"
                    name="Collected"
                    dataKey="paid"
                    stroke="#10b981"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorPaid)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Invoice Status Distribution (Pie Chart) */}
        <div className="bg-card border border-border rounded-xl p-5 flex flex-col justify-between">
          <div className="mb-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Invoices Breakdown</h2>
            <p className="text-xs text-muted-foreground">Distribution of invoicing resources by status</p>
          </div>
          <div className="h-80 flex flex-col justify-between">
            {data.invoiceStatusData.length === 0 ? (
              <div className="flex h-full items-center justify-center text-muted-foreground text-sm">
                No invoices found.
              </div>
            ) : (
              <>
                <div className="h-60 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={data.invoiceStatusData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {data.invoiceStatusData.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: any) => [`${value} Invoices`, undefined]} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-2 justify-center text-xs pb-2">
                  {data.invoiceStatusData.map((entry: any, index: number) => (
                    <div key={entry.name} className="flex items-center gap-1.5">
                      <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                      <span className="font-medium text-slate-750 dark:text-slate-200">{entry.name}</span>
                      <span className="text-muted-foreground">({entry.value})</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Secondary Charts Row */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Project Workload Chart */}
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="mb-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Project Workload</h2>
            <p className="text-xs text-muted-foreground">Status and distribution of organization projects</p>
          </div>
          <div className="h-80">
            {data.projectWorkloadData.length === 0 ? (
              <div className="flex h-full items-center justify-center text-muted-foreground text-sm">
                No projects registered yet.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.projectWorkloadData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-800" />
                  <XAxis dataKey="name" stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip />
                  <Bar dataKey="value" name="Projects Count" fill="#f59e0b" radius={[4, 4, 0, 0]}>
                    {data.projectWorkloadData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[(index + 3) % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Lead Funnel Chart */}
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="mb-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">CRM Lead Funnel</h2>
            <p className="text-xs text-muted-foreground">Distribution of active leads across lifecycle stages</p>
          </div>
          <div className="h-80">
            {data.leadFunnelData.length === 0 ? (
              <div className="flex h-full items-center justify-center text-muted-foreground text-sm">
                No active leads in CRM pipeline.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.leadFunnelData} layout="vertical" margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-800" />
                  <XAxis type="number" stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis dataKey="name" type="category" stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip />
                  <Bar dataKey="count" name="Leads Count" fill="#6366f1" radius={[0, 4, 4, 0]}>
                    {data.leadFunnelData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[(index + 4) % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

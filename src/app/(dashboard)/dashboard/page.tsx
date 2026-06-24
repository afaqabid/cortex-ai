"use client";

import { motion, Variants } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  FolderKanban,
  CheckSquare,
  Users,
  Receipt,
  Clock,
  Sparkles,
  ArrowUpRight,
  BarChart3,
  Zap,
} from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";

// Demo data

const recentActivities = [
  {
    id: "1",
    user: "Sarah Chen",
    action: "completed task",
    target: "Homepage Redesign",
    time: "2m ago",
    avatar: "SC",
    color: "bg-emerald-500",
  },
  {
    id: "2",
    user: "Alex Morgan",
    action: "created invoice",
    target: "INV-2024-0042",
    time: "15m ago",
    avatar: "AM",
    color: "bg-blue-500",
  },
  {
    id: "3",
    user: "Jordan Lee",
    action: "moved lead to",
    target: "Qualified",
    time: "1h ago",
    avatar: "JL",
    color: "bg-violet-500",
  },
  {
    id: "4",
    user: "Taylor Swift",
    action: "uploaded file to",
    target: "Brand Assets",
    time: "2h ago",
    avatar: "TS",
    color: "bg-amber-500",
  },
  {
    id: "5",
    user: "Chris Davis",
    action: "commented on",
    target: "API Integration",
    time: "3h ago",
    avatar: "CD",
    color: "bg-pink-500",
  },
];

const upcomingDeadlines = [
  {
    id: "1",
    task: "Client Presentation",
    project: "Website Redesign",
    dueDate: "Tomorrow",
    priority: "URGENT",
    color: "bg-red-500",
  },
  {
    id: "2",
    task: "API Documentation",
    project: "SaaS Platform",
    dueDate: "In 2 days",
    priority: "HIGH",
    color: "bg-amber-500",
  },
  {
    id: "3",
    task: "Design Review",
    project: "Mobile App",
    dueDate: "In 3 days",
    priority: "MEDIUM",
    color: "bg-blue-500",
  },
  {
    id: "4",
    task: "Sprint Planning",
    project: "E-commerce",
    dueDate: "In 5 days",
    priority: "LOW",
    color: "bg-emerald-500",
  },
];

const pendingInvoices = [
  {
    id: "1",
    number: "INV-2024-0038",
    client: "TechCorp Inc.",
    amount: 12500,
    dueDate: "Overdue by 3 days",
    status: "overdue",
  },
  {
    id: "2",
    number: "INV-2024-0039",
    client: "Design Studio Co.",
    amount: 8750,
    dueDate: "Due tomorrow",
    status: "due_soon",
  },
  {
    id: "3",
    number: "INV-2024-0041",
    client: "StartupXYZ",
    amount: 4200,
    dueDate: "Due in 5 days",
    status: "pending",
  },
];

const aiInsights = [
  {
    id: "1",
    icon: TrendingUp,
    title: "Revenue trending up",
    description: "Revenue increased 12.5% compared to last month. Top contributor: Website Redesign project.",
    color: "text-emerald-500",
  },
  {
    id: "2",
    icon: Clock,
    title: "3 tasks at risk",
    description: "Tasks in the Mobile App project may miss their deadline based on current velocity.",
    color: "text-amber-500",
  },
  {
    id: "3",
    icon: Zap,
    title: "Lead conversion opportunity",
    description: "Lead 'ABC Corp' has a high engagement score. Recommend scheduling a follow-up call.",
    color: "text-blue-500",
  },
];

// Simple area chart using SVG
function MiniChart({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const width = 120;
  const height = 40;
  const points = data.map((v, i) => ({
    x: (i / (data.length - 1)) * width,
    y: height - ((v - min) / range) * height * 0.8 - height * 0.1,
  }));

  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const areaPath = `${linePath} L ${width} ${height} L 0 ${height} Z`;

  return (
    <svg width={width} height={height} className="overflow-visible">
      <defs>
        <linearGradient id={`gradient-${color}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.3} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#gradient-${color})`} />
      <path d={linePath} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const container: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const item: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

import { useLeads } from "@/hooks/queries/use-leads";
import { useProjects } from "@/hooks/queries/use-projects";
import { useTasks } from "@/hooks/queries/use-tasks";

export default function DashboardPage() {
  const { leads } = useLeads();
  const { projects } = useProjects();
  const { tasks } = useTasks();

  const pipelineValue = leads.reduce((sum: number, lead: any) => sum + (lead.value || 0), 0);
  const activeLeadsCount = leads.length;
  const activeProjectsCount = projects.filter((p: any) => p.status === "ACTIVE").length;
  const openTasksCount = tasks.filter((t: any) => t.status !== "DONE" && t.status !== "CANCELLED").length;

  const stats = [
    {
      title: "Pipeline Value",
      value: formatCurrency(pipelineValue),
      change: "+12.5%",
      trend: "up" as const,
      icon: DollarSign,
      color: "from-emerald-500 to-teal-600",
      bgColor: "bg-emerald-500/10",
      textColor: "text-emerald-500",
    },
    {
      title: "Active Projects",
      value: activeProjectsCount.toString(),
      change: `+${activeProjectsCount}`,
      trend: "up" as const,
      icon: FolderKanban,
      color: "from-blue-500 to-indigo-600",
      bgColor: "bg-blue-500/10",
      textColor: "text-blue-500",
    },
    {
      title: "Open Tasks",
      value: openTasksCount.toString(),
      change: `+${openTasksCount}`,
      trend: "down" as const,
      icon: CheckSquare,
      color: "from-violet-500 to-purple-600",
      bgColor: "bg-violet-500/10",
      textColor: "text-violet-500",
    },
    {
      title: "Total Leads",
      value: activeLeadsCount.toString(),
      change: `+${activeLeadsCount}`,
      trend: "up" as const,
      icon: Users,
      color: "from-amber-500 to-orange-600",
      bgColor: "bg-amber-500/10",
      textColor: "text-amber-500",
    },
  ];

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      {/* Welcome */}
      <motion.div variants={item}>
        <h1 className="text-2xl font-bold tracking-tight">Welcome back 👋</h1>
        <p className="text-muted-foreground mt-1">
          Here&apos;s what&apos;s happening across your workspace today.
        </p>
      </motion.div>

      {/* Stat Cards */}
      <motion.div variants={item} className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.title}
              variants={item}
              whileHover={{ y: -2 }}
              className="relative overflow-hidden rounded-xl border border-border bg-card p-5 transition-shadow hover:shadow-lg"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold mt-1">{stat.value}</p>
                  <div className="flex items-center gap-1 mt-2">
                    {stat.trend === "up" ? (
                      <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
                    ) : (
                      <TrendingDown className="h-3.5 w-3.5 text-emerald-500" />
                    )}
                    <span className="text-xs font-medium text-emerald-500">
                      {stat.change}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      vs last month
                    </span>
                  </div>
                </div>
                <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl", stat.bgColor)}>
                  <Icon className={cn("h-5 w-5", stat.textColor)} />
                </div>
              </div>
              <div className="absolute bottom-0 right-0 opacity-60">
                <MiniChart
                  data={[30, 45, 35, 55, 48, 62, 58, 72, 68, 85]}
                  color={stat.textColor.replace("text-", "").includes("emerald") ? "#22c55e" :
                    stat.textColor.includes("blue") ? "#3b82f6" :
                    stat.textColor.includes("violet") ? "#8b5cf6" : "#f59e0b"}
                />
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart Placeholder */}
        <motion.div
          variants={item}
          className="lg:col-span-2 rounded-xl border border-border bg-card p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-semibold">Revenue Overview</h3>
              <p className="text-sm text-muted-foreground">Monthly revenue trend</p>
            </div>
            <div className="flex items-center gap-2">
              {["7D", "1M", "3M", "1Y"].map((period) => (
                <button
                  key={period}
                  className={cn(
                    "px-2.5 py-1 text-xs font-medium rounded-md transition-colors",
                    period === "1M"
                      ? "bg-brand-500 text-white"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  )}
                >
                  {period}
                </button>
              ))}
            </div>
          </div>
          {/* Chart area */}
          <div className="h-64 flex items-end gap-2">
            {[
              { label: "Jan", value: 65 },
              { label: "Feb", value: 45 },
              { label: "Mar", value: 75 },
              { label: "Apr", value: 55 },
              { label: "May", value: 80 },
              { label: "Jun", value: 90 },
              { label: "Jul", value: 70 },
              { label: "Aug", value: 85 },
              { label: "Sep", value: 95 },
              { label: "Oct", value: 78 },
              { label: "Nov", value: 88 },
              { label: "Dec", value: 100 },
            ].map((bar, i) => (
              <div key={bar.label} className="flex-1 flex flex-col items-center gap-2">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${bar.value}%` }}
                  transition={{ duration: 0.6, delay: i * 0.05, ease: "easeOut" }}
                  className={cn(
                    "w-full rounded-t-md",
                    i === 11
                      ? "bg-gradient-to-t from-brand-600 to-brand-400"
                      : "bg-brand-500/20 hover:bg-brand-500/30 transition-colors"
                  )}
                />
                <span className="text-[10px] text-muted-foreground">
                  {bar.label}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* AI Insights */}
        <motion.div variants={item} className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500/10">
              <Sparkles className="h-4 w-4 text-brand-500" />
            </div>
            <div>
              <h3 className="text-base font-semibold">AI Insights</h3>
              <p className="text-xs text-muted-foreground">Powered by Cortex AI</p>
            </div>
          </div>
          <div className="space-y-4">
            {aiInsights.map((insight) => {
              const InsightIcon = insight.icon;
              return (
                <motion.div
                  key={insight.id}
                  whileHover={{ x: 2 }}
                  className="flex gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
                >
                  <InsightIcon className={cn("h-4 w-4 mt-0.5 shrink-0", insight.color)} />
                  <div>
                    <p className="text-sm font-medium">{insight.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                      {insight.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
          <button className="flex items-center gap-1.5 text-xs text-brand-500 hover:text-brand-600 font-medium mt-4 transition-colors">
            <Sparkles className="h-3 w-3" />
            Ask AI for more insights
          </button>
        </motion.div>
      </div>

      {/* Second row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activities */}
        <motion.div variants={item} className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold">Recent Activity</h3>
            <button className="text-xs text-brand-500 hover:text-brand-600 font-medium transition-colors flex items-center gap-1">
              View all <ArrowUpRight className="h-3 w-3" />
            </button>
          </div>
          <div className="space-y-3">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3">
                <div
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white text-xs font-bold",
                    activity.color
                  )}
                >
                  {activity.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm">
                    <span className="font-medium">{activity.user}</span>{" "}
                    <span className="text-muted-foreground">{activity.action}</span>{" "}
                    <span className="font-medium">{activity.target}</span>
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Upcoming Deadlines */}
        <motion.div variants={item} className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold">Upcoming Deadlines</h3>
            <button className="text-xs text-brand-500 hover:text-brand-600 font-medium transition-colors flex items-center gap-1">
              View all <ArrowUpRight className="h-3 w-3" />
            </button>
          </div>
          <div className="space-y-3">
            {upcomingDeadlines.map((deadline) => (
              <div key={deadline.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                <div className={cn("w-1 h-10 rounded-full shrink-0", deadline.color)} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{deadline.task}</p>
                  <p className="text-xs text-muted-foreground">{deadline.project}</p>
                </div>
                <div className="text-right">
                  <span
                    className={cn(
                      "text-xs font-medium px-2 py-0.5 rounded-full",
                      deadline.priority === "URGENT"
                        ? "bg-red-500/10 text-red-500"
                        : deadline.priority === "HIGH"
                          ? "bg-amber-500/10 text-amber-500"
                          : deadline.priority === "MEDIUM"
                            ? "bg-blue-500/10 text-blue-500"
                            : "bg-emerald-500/10 text-emerald-500"
                    )}
                  >
                    {deadline.dueDate}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Pending Invoices */}
        <motion.div variants={item} className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold">Pending Invoices</h3>
            <button className="text-xs text-brand-500 hover:text-brand-600 font-medium transition-colors flex items-center gap-1">
              View all <ArrowUpRight className="h-3 w-3" />
            </button>
          </div>
          <div className="space-y-3">
            {pendingInvoices.map((invoice) => (
              <div key={invoice.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                <div
                  className={cn(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                    invoice.status === "overdue"
                      ? "bg-red-500/10"
                      : invoice.status === "due_soon"
                        ? "bg-amber-500/10"
                        : "bg-muted"
                  )}
                >
                  <Receipt
                    className={cn(
                      "h-4 w-4",
                      invoice.status === "overdue"
                        ? "text-red-500"
                        : invoice.status === "due_soon"
                          ? "text-amber-500"
                          : "text-muted-foreground"
                    )}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{invoice.client}</p>
                  <p className="text-xs text-muted-foreground">{invoice.number}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold">
                    {formatCurrency(invoice.amount)}
                  </p>
                  <p
                    className={cn(
                      "text-xs",
                      invoice.status === "overdue"
                        ? "text-red-500"
                        : invoice.status === "due_soon"
                          ? "text-amber-500"
                          : "text-muted-foreground"
                    )}
                  >
                    {invoice.dueDate}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-border">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total Outstanding</span>
              <span className="text-lg font-bold">
                {formatCurrency(
                  pendingInvoices.reduce((sum, inv) => sum + inv.amount, 0)
                )}
              </span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Team Performance */}
      <motion.div variants={item} className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-brand-500" />
            <h3 className="text-base font-semibold">Team Performance</h3>
          </div>
          <button className="text-xs text-brand-500 hover:text-brand-600 font-medium transition-colors flex items-center gap-1">
            View details <ArrowUpRight className="h-3 w-3" />
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { name: "Sarah Chen", role: "Lead Designer", tasks: 18, completed: 15, avatar: "SC", color: "bg-emerald-500" },
            { name: "Alex Morgan", role: "Developer", tasks: 24, completed: 20, avatar: "AM", color: "bg-blue-500" },
            { name: "Jordan Lee", role: "Sales Lead", tasks: 12, completed: 10, avatar: "JL", color: "bg-violet-500" },
            { name: "Taylor Swift", role: "PM", tasks: 15, completed: 13, avatar: "TS", color: "bg-amber-500" },
          ].map((member) => {
            const percentage = Math.round((member.completed / member.tasks) * 100);
            return (
              <div key={member.name} className="flex flex-col items-center p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
                <div className={cn("flex h-12 w-12 items-center justify-center rounded-full text-white font-bold", member.color)}>
                  {member.avatar}
                </div>
                <p className="text-sm font-medium mt-3">{member.name}</p>
                <p className="text-xs text-muted-foreground">{member.role}</p>
                <div className="w-full mt-3">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-muted-foreground">
                      {member.completed}/{member.tasks} tasks
                    </span>
                    <span className="font-medium">{percentage}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 0.8, delay: 0.3 }}
                      className={cn("h-full rounded-full", member.color)}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>
    </motion.div>
  );
}

// ============================================
// User Roles & Permissions
// ============================================

export const USER_ROLES = {
  OWNER: "OWNER",
  ADMIN: "ADMIN",
  MANAGER: "MANAGER",
  EMPLOYEE: "EMPLOYEE",
  CLIENT: "CLIENT",
  TEAM_LEAD: "TEAM_LEAD",
  DEVELOPER: "DEVELOPER",
  DESIGNER: "DESIGNER",
  QA: "QA",
} as const;

export const ROLE_LABELS: Record<string, string> = {
  OWNER: "Owner",
  ADMIN: "Admin",
  MANAGER: "Manager",
  EMPLOYEE: "Employee",
  CLIENT: "Client",
  TEAM_LEAD: "Team Lead",
  DEVELOPER: "Developer",
  DESIGNER: "Designer",
  QA: "QA Specialist",
};

export const ROLE_HIERARCHY: Record<string, number> = {
  OWNER: 4,
  ADMIN: 3,
  MANAGER: 2,
  TEAM_LEAD: 2,
  DEVELOPER: 1,
  DESIGNER: 1,
  QA: 1,
  EMPLOYEE: 1,
  CLIENT: 0,
};

// ============================================
// Lead Statuses
// ============================================

export const LEAD_STATUSES = {
  NEW: "NEW",
  CONTACTED: "CONTACTED",
  QUALIFIED: "QUALIFIED",
  PROPOSAL: "PROPOSAL",
  NEGOTIATION: "NEGOTIATION",
  WON: "WON",
  LOST: "LOST",
} as const;

export const LEAD_STATUS_LABELS: Record<string, string> = {
  NEW: "New",
  CONTACTED: "Contacted",
  QUALIFIED: "Qualified",
  PROPOSAL: "Proposal",
  NEGOTIATION: "Negotiation",
  WON: "Won",
  LOST: "Lost",
};

export const LEAD_STATUS_COLORS: Record<string, string> = {
  NEW: "#6366f1",
  CONTACTED: "#3b82f6",
  QUALIFIED: "#06b6d4",
  PROPOSAL: "#8b5cf6",
  NEGOTIATION: "#f59e0b",
  WON: "#22c55e",
  LOST: "#ef4444",
};

// ============================================
// Lead Sources
// ============================================

export const LEAD_SOURCES = {
  WEBSITE: "WEBSITE",
  REFERRAL: "REFERRAL",
  SOCIAL: "SOCIAL",
  EMAIL: "EMAIL",
  COLD_CALL: "COLD_CALL",
  ADVERTISEMENT: "ADVERTISEMENT",
  OTHER: "OTHER",
} as const;

export const LEAD_SOURCE_LABELS: Record<string, string> = {
  WEBSITE: "Website",
  REFERRAL: "Referral",
  SOCIAL: "Social Media",
  EMAIL: "Email",
  COLD_CALL: "Cold Call",
  ADVERTISEMENT: "Advertisement",
  OTHER: "Other",
};

// ============================================
// Project Statuses
// ============================================

export const PROJECT_STATUSES = {
  PLANNING: "PLANNING",
  ACTIVE: "ACTIVE",
  ON_HOLD: "ON_HOLD",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
} as const;

export const PROJECT_STATUS_LABELS: Record<string, string> = {
  PLANNING: "Planning",
  ACTIVE: "Active",
  ON_HOLD: "On Hold",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

export const PROJECT_STATUS_COLORS: Record<string, string> = {
  PLANNING: "#6366f1",
  ACTIVE: "#22c55e",
  ON_HOLD: "#f59e0b",
  COMPLETED: "#06b6d4",
  CANCELLED: "#ef4444",
};

// ============================================
// Task Statuses & Priorities
// ============================================

export const TASK_STATUSES = {
  BACKLOG: "BACKLOG",
  TODO: "TODO",
  IN_PROGRESS: "IN_PROGRESS",
  IN_REVIEW: "IN_REVIEW",
  DONE: "DONE",
  CANCELLED: "CANCELLED",
} as const;

export const TASK_STATUS_LABELS: Record<string, string> = {
  BACKLOG: "Backlog",
  TODO: "To Do",
  IN_PROGRESS: "In Progress",
  IN_REVIEW: "In Review",
  DONE: "Done",
  CANCELLED: "Cancelled",
};

export const TASK_STATUS_COLORS: Record<string, string> = {
  BACKLOG: "#94a3b8",
  TODO: "#6366f1",
  IN_PROGRESS: "#f59e0b",
  IN_REVIEW: "#8b5cf6",
  DONE: "#22c55e",
  CANCELLED: "#ef4444",
};

export const TASK_PRIORITIES = {
  LOW: "LOW",
  MEDIUM: "MEDIUM",
  HIGH: "HIGH",
  URGENT: "URGENT",
} as const;

export const TASK_PRIORITY_LABELS: Record<string, string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
  URGENT: "Urgent",
};

export const TASK_PRIORITY_COLORS: Record<string, string> = {
  LOW: "#22c55e",
  MEDIUM: "#3b82f6",
  HIGH: "#f59e0b",
  URGENT: "#ef4444",
};

// ============================================
// Invoice Statuses
// ============================================

export const INVOICE_STATUSES = {
  DRAFT: "DRAFT",
  SENT: "SENT",
  VIEWED: "VIEWED",
  PAID: "PAID",
  OVERDUE: "OVERDUE",
  CANCELLED: "CANCELLED",
  REFUNDED: "REFUNDED",
} as const;

export const INVOICE_STATUS_LABELS: Record<string, string> = {
  DRAFT: "Draft",
  SENT: "Sent",
  VIEWED: "Viewed",
  PAID: "Paid",
  OVERDUE: "Overdue",
  CANCELLED: "Cancelled",
  REFUNDED: "Refunded",
};

export const INVOICE_STATUS_COLORS: Record<string, string> = {
  DRAFT: "#94a3b8",
  SENT: "#3b82f6",
  VIEWED: "#8b5cf6",
  PAID: "#22c55e",
  OVERDUE: "#ef4444",
  CANCELLED: "#6b7280",
  REFUNDED: "#f59e0b",
};

// ============================================
// Navigation
// ============================================

export const NAV_ITEMS = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: "LayoutDashboard",
    section: "main",
  },
  {
    label: "CRM",
    icon: "Users",
    section: "main",
    children: [
      { label: "Leads", href: "/crm/leads", icon: "UserPlus" },
      { label: "Contacts", href: "/crm/contacts", icon: "Contact" },
      { label: "Companies", href: "/crm/companies", icon: "Building2" },
      { label: "Pipelines", href: "/crm/pipelines", icon: "GitBranch" },
    ],
  },
  {
    label: "Projects",
    href: "/projects",
    icon: "FolderKanban",
    section: "main",
  },
  {
    label: "Tasks",
    href: "/tasks",
    icon: "CheckSquare",
    section: "main",
  },
  {
    label: "Invoices",
    href: "/invoices",
    icon: "Receipt",
    section: "finance",
  },
  {
    label: "Knowledge",
    href: "/knowledge",
    icon: "BookOpen",
    section: "content",
  },
  {
    label: "Files",
    href: "/files",
    icon: "FileText",
    section: "content",
  },
  {
    label: "Team",
    href: "/team",
    icon: "UsersRound",
    section: "team",
  },
  {
    label: "Analytics",
    href: "/analytics",
    icon: "BarChart3",
    section: "insights",
  },
  {
    label: "AI Assistant",
    href: "/ai-assistant",
    icon: "Sparkles",
    section: "ai",
  },
] as const;

// ============================================
// App Constants
// ============================================

export const APP_NAME = "Cortex AI";
export const APP_DESCRIPTION =
  "AI-Powered Business Operating System for agencies, startups, and SMBs.";

export const ITEMS_PER_PAGE = 25;
export const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
export const ALLOWED_FILE_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/svg+xml",
  "video/mp4",
  "video/webm",
];

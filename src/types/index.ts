import type {
  Organization,
  User,
  Member,
  Team,
  TeamMember,
  Client,
  Lead,
  Contact,
  Pipeline,
  PipelineStage,
  Project,
  Task,
  Milestone,
  Invoice,
  InvoiceItem,
  Document,
  Folder,
  File as PrismaFile,
  Comment,
  Activity,
  Notification,
  AuditLog,
} from "@prisma/client";

// Re-export Prisma types
export type {
  Organization,
  User,
  Member,
  Team,
  TeamMember,
  Client,
  Lead,
  Contact,
  Pipeline,
  PipelineStage,
  Project,
  Task,
  Milestone,
  Invoice,
  InvoiceItem,
  Document,
  Folder,
  Comment,
  Activity,
  Notification,
  AuditLog,
};

export type { PrismaFile as FileRecord };

// ============================================
// Extended Types (with relations)
// ============================================

export type UserWithMemberships = User & {
  memberships: (Member & { organization: Organization })[];
};

export type MemberWithUser = Member & {
  user: User;
};

export type OrganizationWithMembers = Organization & {
  members: MemberWithUser[];
};

export type TeamWithMembers = Team & {
  members: (TeamMember & { user: User })[];
};

export type LeadWithRelations = Lead & {
  createdBy: User;
  assignedTo: User | null;
  pipelineStage: PipelineStage | null;
  contacts: Contact[];
};

export type PipelineWithStages = Pipeline & {
  stages: (PipelineStage & { leads: Lead[] })[];
};

export type ProjectWithRelations = Project & {
  client: Client | null;
  team: Team | null;
  createdBy: User;
  tasks: Task[];
  milestones: Milestone[];
  _count?: {
    tasks: number;
  };
};

export type TaskWithRelations = Task & {
  project: Project;
  assignee: User | null;
  createdBy: User;
  subtasks: Task[];
  comments: Comment[];
};

export type InvoiceWithRelations = Invoice & {
  client: Client;
  createdBy: User;
  items: InvoiceItem[];
};

export type DocumentWithRelations = Document & {
  category: { id: string; name: string; slug: string } | null;
  createdBy: User;
  children: Document[];
};

export type CommentWithUser = Comment & {
  user: User;
  replies: (Comment & { user: User })[];
};

export type ActivityWithUser = Activity & {
  user: User;
};

// ============================================
// API Response Types
// ============================================

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasMore: boolean;
}

export interface PaginationParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  search?: string;
}

// ============================================
// Dashboard Types
// ============================================

export interface DashboardStats {
  revenue: {
    total: number;
    change: number;
    data: { date: string; amount: number }[];
  };
  projects: {
    active: number;
    completed: number;
    total: number;
  };
  tasks: {
    todo: number;
    inProgress: number;
    completed: number;
    overdue: number;
  };
  invoices: {
    pending: number;
    pendingAmount: number;
    overdue: number;
    overdueAmount: number;
  };
  clients: {
    total: number;
    new: number;
  };
}

export interface RecentActivity {
  id: string;
  type: string;
  description: string;
  user: { name: string; image: string | null };
  createdAt: string;
  entityType: string;
  entityId: string;
}

// ============================================
// Session / Auth Types
// ============================================

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  image: string | null;
}

export interface SessionData {
  user: SessionUser;
  organizationId: string;
  role: string;
}

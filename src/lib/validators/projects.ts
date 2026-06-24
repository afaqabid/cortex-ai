import { z } from "zod";

export const createProjectSchema = z.object({
  name: z.string().min(1, "Project name is required"),
  description: z.string().optional(),
  status: z
    .enum(["PLANNING", "ACTIVE", "ON_HOLD", "COMPLETED", "CANCELLED"])
    .default("PLANNING"),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  budget: z.number().min(0).optional(),
  clientId: z.string().optional(),
  teamId: z.string().optional(),
  color: z.string().optional(),
});

export const updateProjectSchema = createProjectSchema.partial();

export const createTaskSchema = z.object({
  title: z.string().min(1, "Task title is required"),
  description: z.string().optional(),
  status: z
    .enum([
      "BACKLOG",
      "TODO",
      "IN_PROGRESS",
      "IN_REVIEW",
      "DONE",
      "CANCELLED",
    ])
    .default("TODO"),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).default("MEDIUM"),
  dueDate: z.string().optional(),
  startDate: z.string().optional(),
  estimatedHours: z.number().min(0).optional(),
  projectId: z.string(),
  assigneeId: z.string().optional(),
  parentId: z.string().optional(),
  milestoneId: z.string().optional(),
});

export const updateTaskSchema = createTaskSchema.partial().omit({
  projectId: true,
});

export const createMilestoneSchema = z.object({
  name: z.string().min(1, "Milestone name is required"),
  description: z.string().optional(),
  dueDate: z.string().optional(),
  projectId: z.string(),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type CreateMilestoneInput = z.infer<typeof createMilestoneSchema>;

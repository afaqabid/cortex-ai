import { prisma } from "@/lib/prisma";
import {
  CreateProjectInput,
  UpdateProjectInput,
  CreateTaskInput,
  UpdateTaskInput,
  CreateMilestoneInput,
} from "@/lib/validators/projects";
import { ProjectStatus, TaskStatus, TaskPriority } from "@prisma/client";

export class ProjectService {
  // ============================================
  // PROJECTS
  // ============================================

  static async getProjects(organizationId: string) {
    return await prisma.project.findMany({
      where: { organizationId },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            company: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            tasks: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  static async getProjectById(id: string, organizationId: string) {
    return await prisma.project.findFirst({
      where: { id, organizationId },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            company: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
          },
        },
        tasks: {
          include: {
            assignee: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
          orderBy: { order: "asc" },
        },
        milestones: {
          orderBy: { dueDate: "asc" },
        },
      },
    });
  }

  static async createProject(
    data: CreateProjectInput & { createdById: string },
    organizationId: string
  ) {
    return await prisma.project.create({
      data: {
        name: data.name,
        description: data.description || null,
        status: data.status as ProjectStatus || "PLANNING",
        startDate: data.startDate ? new Date(data.startDate) : null,
        endDate: data.endDate ? new Date(data.endDate) : null,
        budget: data.budget || null,
        color: data.color || null,
        organizationId,
        createdById: data.createdById,
        clientId: data.clientId || null,
        teamId: data.teamId || null,
      },
    });
  }

  static async updateProject(id: string, data: UpdateProjectInput, organizationId: string) {
    return await prisma.project.update({
      where: { id, organizationId },
      data: {
        name: data.name,
        description: data.description,
        status: data.status as ProjectStatus || undefined,
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        endDate: data.endDate ? new Date(data.endDate) : undefined,
        budget: data.budget,
        color: data.color,
        clientId: data.clientId,
        teamId: data.teamId,
      },
    });
  }

  static async deleteProject(id: string, organizationId: string) {
    return await prisma.project.delete({
      where: { id, organizationId },
    });
  }

  // ============================================
  // TASKS
  // ============================================

  static async getTasks(organizationId: string, projectId?: string) {
    return await prisma.task.findMany({
      where: {
        project: {
          organizationId,
        },
        projectId: projectId || undefined,
      },
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        project: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: [{ status: "asc" }, { order: "asc" }],
    });
  }

  static async createTask(
    data: CreateTaskInput & { createdById: string },
    organizationId: string
  ) {
    // Verify project belongs to organization
    const project = await prisma.project.findFirst({
      where: { id: data.projectId, organizationId },
    });

    if (!project) throw new Error("Project not found in organization");

    // Get max order in current status
    const count = await prisma.task.count({
      where: { projectId: data.projectId, status: data.status as TaskStatus },
    });

    return await prisma.task.create({
      data: {
        title: data.title,
        description: data.description || null,
        status: data.status as TaskStatus || "TODO",
        priority: data.priority as TaskPriority || "MEDIUM",
        order: count,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        startDate: data.startDate ? new Date(data.startDate) : null,
        estimatedHours: data.estimatedHours || null,
        projectId: data.projectId,
        assigneeId: data.assigneeId || null,
        createdById: data.createdById,
        parentId: data.parentId || null,
        milestoneId: data.milestoneId || null,
      },
    });
  }

  static async updateTask(id: string, data: UpdateTaskInput, organizationId: string) {
    // Verify task belongs to organization
    const task = await prisma.task.findFirst({
      where: { id, project: { organizationId } },
    });

    if (!task) throw new Error("Task not found");

    return await prisma.task.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,
        status: data.status as TaskStatus || undefined,
        priority: data.priority as TaskPriority || undefined,
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        estimatedHours: data.estimatedHours,
        assigneeId: data.assigneeId,
        parentId: data.parentId,
        milestoneId: data.milestoneId,
      },
    });
  }

  static async deleteTask(id: string, organizationId: string) {
    const task = await prisma.task.findFirst({
      where: { id, project: { organizationId } },
    });

    if (!task) throw new Error("Task not found");

    return await prisma.task.delete({
      where: { id },
    });
  }

  // ============================================
  // MILESTONES
  // ============================================

  static async createMilestone(
    data: CreateMilestoneInput,
    organizationId: string
  ) {
    const project = await prisma.project.findFirst({
      where: { id: data.projectId, organizationId },
    });

    if (!project) throw new Error("Project not found");

    return await prisma.milestone.create({
      data: {
        name: data.name,
        description: data.description || null,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        projectId: data.projectId,
      },
    });
  }

  static async updateMilestone(
    id: string,
    data: { completed?: boolean; name?: string; description?: string; dueDate?: string },
    organizationId: string
  ) {
    const milestone = await prisma.milestone.findFirst({
      where: { id, project: { organizationId } },
    });

    if (!milestone) throw new Error("Milestone not found");

    return await prisma.milestone.update({
      where: { id },
      data: {
        completed: data.completed !== undefined ? data.completed : undefined,
        completedAt: data.completed === true ? new Date() : data.completed === false ? null : undefined,
        name: data.name,
        description: data.description,
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
      },
    });
  }

  static async deleteMilestone(id: string, organizationId: string) {
    const milestone = await prisma.milestone.findFirst({
      where: { id, project: { organizationId } },
    });

    if (!milestone) throw new Error("Milestone not found");

    return await prisma.milestone.delete({
      where: { id },
    });
  }
}

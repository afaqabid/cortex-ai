import { prisma } from "@/lib/prisma";

export class CommentService {
  static async getComments(
    entityType: "project" | "task" | "lead" | "document",
    entityId: string
  ) {
    const whereClause: any = {};
    if (entityType === "project") {
      whereClause.projects = { some: { id: entityId } };
    } else if (entityType === "task") {
      whereClause.tasks = { some: { id: entityId } };
    } else if (entityType === "lead") {
      whereClause.leads = { some: { id: entityId } };
    } else if (entityType === "document") {
      whereClause.documents = { some: { id: entityId } };
    }

    return await prisma.comment.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        replies: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
          orderBy: { createdAt: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  static async createComment(
    entityType: "project" | "task" | "lead" | "document",
    entityId: string,
    userId: string,
    content: string,
    parentId?: string
  ) {
    const connectRelation: any = {};
    if (entityType === "project") {
      connectRelation.projects = { connect: { id: entityId } };
    } else if (entityType === "task") {
      connectRelation.tasks = { connect: { id: entityId } };
    } else if (entityType === "lead") {
      connectRelation.leads = { connect: { id: entityId } };
    } else if (entityType === "document") {
      connectRelation.documents = { connect: { id: entityId } };
    }

    // Create the comment and connect it to the corresponding entity
    const comment = await prisma.comment.create({
      data: {
        content,
        userId,
        parentId: parentId || null,
        ...connectRelation,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    // Create an activity entry
    try {
      const description = `commented on ${entityType}`;
      await prisma.activity.create({
        data: {
          type: "commented",
          description,
          entityType,
          entityId,
          userId,
          organizationId: (await prisma.user.findUnique({
            where: { id: userId },
            select: { memberships: { select: { organizationId: true }, take: 1 } }
          }))?.memberships[0]?.organizationId || "",
        }
      });
    } catch (err) {
      console.error("Failed to log comment activity:", err);
    }

    return comment;
  }

  static async deleteComment(id: string, userId: string) {
    // Check if the comment belongs to the user or if user is owner/admin
    const comment = await prisma.comment.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!comment) throw new Error("Comment not found");
    if (comment.userId !== userId) {
      throw new Error("Unauthorized to delete this comment");
    }

    return await prisma.comment.delete({
      where: { id },
    });
  }
}

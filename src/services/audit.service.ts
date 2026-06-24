import { prisma } from "@/lib/prisma";

export class AuditService {
  static async logAction(
    userId: string,
    organizationId: string,
    action: string,
    entityType: string,
    entityId: string | null = null,
    metadata: any = null
  ) {
    return await prisma.auditLog.create({
      data: {
        userId,
        organizationId,
        action,
        entityType,
        entityId,
        metadata: metadata || {},
      },
    });
  }

  static async getLogs(organizationId: string) {
    return await prisma.auditLog.findMany({
      where: { organizationId },
      include: {
        user: {
          select: { name: true, email: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
  }
}

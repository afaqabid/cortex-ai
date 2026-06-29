import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const client =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

// Add middleware to publish member updates to Redis Pub/Sub
client.$use(async (params, next) => {
  const result = await next(params);

  if (params.model === "Member" && params.action === "update") {
    const memberId = params.args.where?.id;
    if (memberId) {
      // Fetch updated member data and publish in the background
      (async () => {
        try {
          const updatedMember = await client.member.findUnique({
            where: { id: memberId },
            include: {
              organization: { select: { name: true } },
            },
          });

          if (updatedMember) {
            const roleLabels: Record<string, string> = {
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
            const roleName = roleLabels[updatedMember.role] || updatedMember.role;
            const notificationTitle = "Role Updated";
            const notificationMessage = `Your role in ${updatedMember.organization.name} has been updated to ${roleName}.`;

            // Prevent duplicate database notification records within 2 seconds
            const duplicateNotification = await client.notification.findFirst({
              where: {
                userId: updatedMember.userId,
                organizationId: updatedMember.organizationId,
                title: notificationTitle,
                message: notificationMessage,
                createdAt: {
                  gte: new Date(Date.now() - 2000),
                },
              },
            });

            if (duplicateNotification) {
              return;
            }

            // Create notification record in database
            const dbNotification = await client.notification.create({
              data: {
                userId: updatedMember.userId,
                organizationId: updatedMember.organizationId,
                title: notificationTitle,
                message: notificationMessage,
                type: "info",
                read: false,
              },
            });

            const { redis } = await import("./redis");
            const payload = JSON.stringify({
              id: dbNotification.id,
              type: "role_updated",
              userId: updatedMember.userId,
              organizationId: updatedMember.organizationId,
              newRole: updatedMember.role,
              notification: {
                id: dbNotification.id,
                title: dbNotification.title,
                message: dbNotification.message,
                type: dbNotification.type,
                read: dbNotification.read,
                createdAt: dbNotification.createdAt.toISOString(),
              },
              timestamp: Date.now(),
            });

            await redis.publish(`org:${updatedMember.organizationId}`, payload);
          }
        } catch (err) {
          console.error("Prisma Member update middleware error:", err);
        }
      })();
    }
  }

  return result;
});

export const prisma = client;

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

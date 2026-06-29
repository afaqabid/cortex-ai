import { prisma } from "@/lib/prisma";

// In-memory cache to prevent concurrent organization creation for the same user
const orgCreationPromises = new Map<string, Promise<string>>();

export async function getOrCreateActiveOrgId(
  userId: string,
  userName: string,
  activeOrgId?: string | null
): Promise<string> {
  if (activeOrgId) {
    return activeOrgId;
  }

  // Fetch all memberships for this user
  const memberships = await prisma.member.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  if (memberships.length > 0) {
    // If they have multiple memberships and one is non-OWNER (like MANAGER, EMPLOYEE, etc.),
    // they were likely invited. Let's prioritize that over their default OWNER organization if activeOrgId is not set.
    const nonOwnerMember = memberships.find((m) => m.role !== "OWNER");
    if (nonOwnerMember) {
      return nonOwnerMember.organizationId;
    }
    return memberships[0].organizationId;
  }

  // Check if there is already a creation promise for this user to prevent parallel race conditions
  let promise = orgCreationPromises.get(userId);
  if (!promise) {
    promise = (async () => {
      try {
        // Double check within the async scope
        const innerMemberships = await prisma.member.findMany({
          where: { userId },
          orderBy: { createdAt: "desc" },
        });
        if (innerMemberships.length > 0) {
          const nonOwnerMember = innerMemberships.find((m) => m.role !== "OWNER");
          return nonOwnerMember ? nonOwnerMember.organizationId : innerMemberships[0].organizationId;
        }

        // Fetch user email to check for pending invitations
        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: { email: true },
        });

        if (user?.email) {
          const pendingInvite = await prisma.invitation.findFirst({
            where: {
              email: { equals: user.email, mode: "insensitive" },
              status: "pending",
            },
          });

          if (pendingInvite) {
            // Do not create a default organization. Return the organization they are invited to.
            return pendingInvite.organizationId;
          }
        }

        // Generate safe slug
        const baseSlug = userName.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "my-org";
        const uniqueSlug = `${baseSlug}-${Math.random().toString(36).substring(2, 7)}`;

        // Create default organization
        const org = await prisma.organization.create({
          data: {
            name: `${userName}'s Workspace`,
            slug: uniqueSlug,
            members: {
              create: {
                userId,
                role: "OWNER",
              },
            },
          },
        });

        return org.id;
      } finally {
        orgCreationPromises.delete(userId);
      }
    })();
    orgCreationPromises.set(userId, promise);
  }

  return promise;
}

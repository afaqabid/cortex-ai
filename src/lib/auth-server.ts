import { prisma } from "@/lib/prisma";

export async function getOrCreateActiveOrgId(
  userId: string,
  userName: string,
  activeOrgId?: string | null
): Promise<string> {
  if (activeOrgId) {
    return activeOrgId;
  }

  const member = await prisma.member.findFirst({
    where: { userId },
  });

  if (member) {
    return member.organizationId;
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
}

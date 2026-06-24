import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Checking DB records...");
  const users = await prisma.user.findMany();
  const orgs = await prisma.organization.findMany();
  const members = await prisma.member.findMany();
  const leads = await prisma.lead.findMany();

  console.log("Users:", users);
  console.log("Orgs:", orgs);
  console.log("Members:", members);
  console.log("Leads:", leads);
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());

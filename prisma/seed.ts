import { PrismaClient, LeadStatus, LeadSource } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database with demo data...");

  // Find the first user in the database
  const user = await prisma.user.findFirst();
  if (!user) {
    console.log("⚠️ No user found. Please register an account first, then run the seed script.");
    return;
  }

  console.log(`👤 Found user: ${user.email}`);

  // Find or create default organization
  let org = await prisma.organization.findFirst({
    where: { members: { some: { userId: user.id } } },
  });

  if (!org) {
    org = await prisma.organization.create({
      data: {
        name: `${user.name}'s Workspace`,
        slug: `${user.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-workspace`,
        members: {
          create: {
            userId: user.id,
            role: "OWNER",
          },
        },
      },
    });
    console.log(`🏢 Created workspace organization: ${org.name}`);
  } else {
    console.log(`🏢 Using existing workspace organization: ${org.name}`);
  }

  // Find or create the default pipeline
  let pipeline = await prisma.pipeline.findFirst({
    where: { organizationId: org.id },
    include: { stages: true },
  });

  if (!pipeline) {
    pipeline = await prisma.pipeline.create({
      data: {
        name: "Sales Pipeline",
        isDefault: true,
        organizationId: org.id,
        stages: {
          create: [
            { name: "New", order: 1, color: "#3b82f6" },
            { name: "Contacted", order: 2, color: "#f59e0b" },
            { name: "Qualified", order: 3, color: "#10b981" },
            { name: "Proposal Sent", order: 4, color: "#8b5cf6" },
            { name: "Negotiation", order: 5, color: "#ec4899" },
            { name: "Won", order: 6, color: "#22c55e" },
            { name: "Lost", order: 7, color: "#ef4444" },
          ],
        },
      },
      include: { stages: true },
    });
    console.log("📊 Created default Sales Pipeline and stages.");
  } else {
    console.log("📊 Sales Pipeline already exists.");
  }

  // Clear existing leads first to avoid duplicates
  await prisma.lead.deleteMany({
    where: { organizationId: org.id },
  });
  console.log("🧹 Cleared old leads.");

  // Insert mock leads connected to pipeline stages
  const stages = pipeline.stages.sort((a, b) => a.order - b.order);

  const mockLeads = [
    {
      name: "Acme Web Redesign",
      company: "Acme Corp",
      email: "billing@acme.com",
      phone: "+1 (555) 987-6543",
      value: 15000,
      source: "WEBSITE" as LeadSource,
      score: 85,
      stageIndex: 0, // New
      status: "NEW" as LeadStatus,
      notes: "Interested in full brand refresh and Next.js redesign.",
    },
    {
      name: "Tesla Mobile Integration",
      company: "Tesla Motors",
      email: "partnerships@tesla.com",
      phone: "+1 (555) 123-9876",
      value: 48000,
      source: "REFERRAL" as LeadSource,
      score: 95,
      stageIndex: 1, // Contacted
      status: "CONTACTED" as LeadStatus,
      notes: "Discussing API sync with charging station networks.",
    },
    {
      name: "Stripe Payment Portal",
      company: "Stripe Inc",
      email: "sales@stripe.com",
      phone: "+1 (555) 456-7890",
      value: 32000,
      source: "EMAIL" as LeadSource,
      score: 90,
      stageIndex: 2, // Qualified
      status: "QUALIFIED" as LeadStatus,
      notes: "Requirements gathering completed. Technical fit approved.",
    },
    {
      name: "Netflix Cloud Migration",
      company: "Netflix Inc",
      email: "cloud@netflix.com",
      phone: "+1 (555) 321-7654",
      value: 85000,
      source: "SOCIAL" as LeadSource,
      score: 75,
      stageIndex: 3, // Proposal Sent
      status: "PROPOSAL" as LeadStatus,
      notes: "Proposal sent on Monday. Awaiting feedback from engineering VP.",
    },
    {
      name: "Amazon Logistics Dashboard",
      company: "Amazon Retail",
      email: "logistics@amazon.com",
      phone: "+1 (555) 789-0123",
      value: 120000,
      source: "COLD_CALL" as LeadSource,
      score: 60,
      stageIndex: 4, // Negotiation
      status: "NEGOTIATION" as LeadStatus,
      notes: "Contract review phase. Discussing SLA details.",
    },
    {
      name: "Airbnb Host Platform",
      company: "Airbnb Inc",
      email: "host-experience@airbnb.com",
      phone: "+1 (555) 901-2345",
      value: 25000,
      source: "OTHER" as LeadSource,
      score: 98,
      stageIndex: 5, // Won
      status: "WON" as LeadStatus,
      notes: "Deal closed successfully! Onboarding scheduled.",
    },
  ];

  for (const lead of mockLeads) {
    const stage = stages[lead.stageIndex];
    await prisma.lead.create({
      data: {
        name: lead.name,
        company: lead.company,
        email: lead.email,
        phone: lead.phone,
        value: lead.value,
        source: lead.source,
        score: lead.score,
        status: lead.status,
        notes: lead.notes,
        organizationId: org.id,
        createdById: user.id,
        assignedToId: user.id,
        pipelineStageId: stage.id,
      },
    });
  }

  console.log(`✅ Seeded ${mockLeads.length} demo leads into pipeline stages!`);
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

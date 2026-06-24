import { prisma } from "@/lib/prisma";
import { CreateLeadInput, UpdateLeadInput, CreateContactInput } from "@/lib/validators/crm";
import { LeadStatus, LeadSource } from "@prisma/client";

export class CRMService {
  // ============================================
  // LEADS
  // ============================================

  static async getLeads(organizationId: string) {
    return await prisma.lead.findMany({
      where: { organizationId },
      include: {
        assignedTo: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        pipelineStage: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  static async getLeadById(id: string, organizationId: string) {
    return await prisma.lead.findFirst({
      where: { id, organizationId },
      include: {
        assignedTo: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        pipelineStage: true,
        contacts: true,
        comments: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });
  }

  static async createLead(data: CreateLeadInput & { createdById: string }, organizationId: string) {
    let stageId = data.pipelineStageId || null;

    if (!stageId) {
      // Find the first stage of the default pipeline
      let pipeline = await prisma.pipeline.findFirst({
        where: { organizationId },
        include: {
          stages: {
            orderBy: { order: "asc" },
            take: 1,
          },
        },
      });

      // If no pipeline exists, create the default one
      if (!pipeline) {
        pipeline = await this.createDefaultPipeline(organizationId);
      }

      if (pipeline && pipeline.stages.length > 0) {
        stageId = pipeline.stages[0].id;
      }
    }

    return await prisma.lead.create({
      data: {
        name: data.name,
        email: data.email || null,
        phone: data.phone || null,
        company: data.company || null,
        title: data.title || null,
        source: data.source,
        value: data.value || 0,
        notes: data.notes || null,
        organizationId,
        createdById: data.createdById,
        assignedToId: data.assignedToId || null,
        pipelineStageId: stageId,
        status: "NEW",
      },
    });
  }

  static async updateLead(id: string, data: UpdateLeadInput, organizationId: string) {
    return await prisma.lead.update({
      where: { id, organizationId },
      data: {
        name: data.name,
        email: data.email || undefined,
        phone: data.phone || undefined,
        company: data.company || undefined,
        title: data.title || undefined,
        source: data.source,
        value: data.value !== undefined ? data.value : undefined,
        notes: data.notes || undefined,
        assignedToId: data.assignedToId || undefined,
        pipelineStageId: data.pipelineStageId || undefined,
        status: data.status as LeadStatus || undefined,
        score: data.score !== undefined ? data.score : undefined,
      },
    });
  }

  static async deleteLead(id: string, organizationId: string) {
    return await prisma.lead.delete({
      where: { id, organizationId },
    });
  }

  // ============================================
  // PIPELINES & STAGES
  // ============================================

  static async getPipelines(organizationId: string) {
    return await prisma.pipeline.findMany({
      where: { organizationId },
      include: {
        stages: {
          orderBy: { order: "asc" },
        },
      },
    });
  }

  static async getPipelineWithLeads(organizationId: string) {
    // Get default pipeline or the first pipeline
    const pipeline = await prisma.pipeline.findFirst({
      where: { organizationId },
      include: {
        stages: {
          orderBy: { order: "asc" },
          include: {
            leads: {
              where: { organizationId },
              include: {
                assignedTo: {
                  select: {
                    id: true,
                    name: true,
                    image: true,
                  },
                },
              },
              orderBy: { updatedAt: "desc" },
            },
          },
        },
      },
    });

    if (pipeline) return pipeline;

    // Auto-create a default pipeline if none exists
    return await this.createDefaultPipeline(organizationId);
  }

  static async createDefaultPipeline(organizationId: string) {
    return await prisma.pipeline.create({
      data: {
        name: "Sales Pipeline",
        isDefault: true,
        organizationId,
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
      include: {
        stages: {
          orderBy: { order: "asc" },
          include: {
            leads: {
              where: { organizationId },
              include: {
                assignedTo: {
                  select: {
                    id: true,
                    name: true,
                    image: true,
                  },
                },
              },
            },
          },
        },
      },
    });
  }

  static async updateLeadStage(leadId: string, stageId: string, organizationId: string) {
    const stage = await prisma.pipelineStage.findUnique({
      where: { id: stageId },
    });

    if (!stage) throw new Error("Stage not found");

    // Map stage names to LeadStatus enum
    let status: LeadStatus = "NEW";
    const stageName = stage.name.toUpperCase();
    if (stageName.includes("NEW")) status = "NEW";
    else if (stageName.includes("CONTACT")) status = "CONTACTED";
    else if (stageName.includes("QUALIFIED")) status = "QUALIFIED";
    else if (stageName.includes("PROPOSAL")) status = "PROPOSAL";
    else if (stageName.includes("NEGOTIATION")) status = "NEGOTIATION";
    else if (stageName.includes("WON")) status = "WON";
    else if (stageName.includes("LOST")) status = "LOST";

    return await prisma.lead.update({
      where: { id: leadId, organizationId },
      data: {
        pipelineStageId: stageId,
        status,
      },
    });
  }

  // ============================================
  // CONTACTS
  // ============================================

  static async getContacts(organizationId: string) {
    return await prisma.contact.findMany({
      where: { organizationId },
      orderBy: { name: "asc" },
    });
  }

  static async createContact(data: CreateContactInput, organizationId: string) {
    return await prisma.contact.create({
      data: {
        name: data.name,
        email: data.email || null,
        phone: data.phone || null,
        title: data.title || null,
        company: data.company || null,
        address: data.address || null,
        notes: data.notes || null,
        leadId: data.leadId || null,
        clientId: data.clientId || null,
        organizationId,
      },
    });
  }

  // ============================================
  // COMPANIES
  // ============================================
  // In the prisma schema, companies are represented simply as a text field on Leads and Contacts,
  // or can be grouped dynamically. Let's create a helper to get unique company names.
  static async getCompanies(organizationId: string) {
    const leads = await prisma.lead.findMany({
      where: { organizationId, NOT: { company: null } },
      select: { company: true },
      distinct: ["company"],
    });

    const contacts = await prisma.contact.findMany({
      where: { organizationId, NOT: { company: null } },
      select: { company: true },
      distinct: ["company"],
    });

    const companyNames = Array.from(
      new Set([
        ...leads.map((l) => l.company),
        ...contacts.map((c) => c.company),
      ].filter(Boolean))
    );

    return companyNames.map((name) => ({
      name,
      leadsCount: leads.filter((l) => l.company === name).length,
      contactsCount: contacts.filter((c) => c.company === name).length,
    }));
  }
}

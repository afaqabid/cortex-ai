import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { getOrCreateActiveOrgId } from "@/lib/auth-server";

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const organizationId = await getOrCreateActiveOrgId(
      session.user.id,
      session.user.name,
      session.session.activeOrganizationId
    );

    const { message } = await req.json();
    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const query = message.toLowerCase();

    let toolUsed: string | null = null;
    let toolData: any = null;
    let text = "";

    if (query.includes("lead") || query.includes("crm") || query.includes("sales")) {
      toolUsed = "searchCRM";
      const leads = await prisma.lead.findMany({
        where: { organizationId },
        take: 5,
        orderBy: { score: "desc" },
      });
      toolData = leads;
      text = `I have queried your CRM database. Here are the top leads associated with your organization sorted by score:`;
    } else if (query.includes("project") || query.includes("milestone") || query.includes("task")) {
      toolUsed = "getProjects";
      const projects = await prisma.project.findMany({
        where: { organizationId },
        include: {
          milestones: true,
          _count: {
            select: { tasks: true },
          },
        },
        take: 5,
      });
      toolData = projects;
      text = `Here is the current projects overview and milestone check-sheets:`;
    } else if (
      query.includes("invoice") ||
      query.includes("billing") ||
      query.includes("revenue") ||
      query.includes("collected") ||
      query.includes("money")
    ) {
      toolUsed = "getAnalytics";
      const invoices = await prisma.invoice.findMany({
        where: { organizationId },
        select: { status: true, total: true },
      });
      let totalBilled = 0;
      let totalCollected = 0;
      invoices.forEach((inv) => {
        totalBilled += inv.total;
        if (inv.status === "PAID") {
          totalCollected += inv.total;
        }
      });
      toolData = {
        totalBilled,
        totalCollected,
        invoiceCount: invoices.length,
      };
      text = `I have calculated your workspace financial summary:`;
    } else if (
      query.includes("document") ||
      query.includes("knowledge") ||
      query.includes("kb") ||
      query.includes("guideline") ||
      query.includes("resource")
    ) {
      toolUsed = "searchDocuments";
      const documents = await prisma.document.findMany({
        where: { organizationId, isPublished: true },
        take: 5,
        orderBy: { updatedAt: "desc" },
      });
      toolData = documents;
      text = `I searched your knowledge base for published materials. Here are the guidelines and reference documents found:`;
    } else if (query.includes("team") || query.includes("member") || query.includes("staff")) {
      toolUsed = "getTeamWorkload";
      const members = await prisma.member.findMany({
        where: { organizationId },
        include: {
          user: {
            select: { name: true, email: true },
          },
        },
        take: 10,
      });
      toolData = members;
      text = `Here are the active team members registered in this organization workspace:`;
    } else {
      text = `Hello! I am your Cortex AI Assistant. I can search CRM records, projects, billing invoices, and the knowledge base.

Try asking me:
* "Show CRM leads"
* "List projects and milestones"
* "Summarize invoice collections"
* "Find knowledge base guidelines"
* "List team members"`;
    }

    return NextResponse.json({
      text,
      toolUsed,
      toolData,
    });
  } catch (error) {
    console.error("POST AI chat error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

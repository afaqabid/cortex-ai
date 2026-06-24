import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { CRMService } from "@/services/crm.service";
import { getOrCreateActiveOrgId } from "@/lib/auth-server";

export async function GET() {
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

    const pipeline = await CRMService.getPipelineWithLeads(organizationId);
    return NextResponse.json(pipeline);
  } catch (error) {
    console.error("GET pipeline error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
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

    const body = await req.json();
    const { leadId, stageId } = body;

    if (!leadId || !stageId) {
      return NextResponse.json({ error: "leadId and stageId are required" }, { status: 400 });
    }

    const lead = await CRMService.updateLeadStage(leadId, stageId, organizationId);
    return NextResponse.json(lead);
  } catch (error) {
    console.error("PUT pipeline error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

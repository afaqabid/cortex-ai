import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { CRMService } from "@/services/crm.service";
import { createLeadSchema } from "@/lib/validators/crm";
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

    const leads = await CRMService.getLeads(organizationId);
    return NextResponse.json(leads);
  } catch (error) {
    console.error("GET leads error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

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

    const body = await req.json();
    const result = createLeadSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error.format() }, { status: 400 });
    }

    const lead = await CRMService.createLead(
      {
        ...result.data,
        createdById: session.user.id,
      },
      organizationId
    );

    return NextResponse.json(lead, { status: 201 });
  } catch (error) {
    console.error("POST lead error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

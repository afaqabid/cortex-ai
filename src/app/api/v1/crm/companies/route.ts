import { NextResponse } from "next/server";
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

    const companies = await CRMService.getCompanies(organizationId);
    return NextResponse.json(companies);
  } catch (error) {
    console.error("GET companies error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

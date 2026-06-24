import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { ProjectService } from "@/services/project.service";
import { createMilestoneSchema } from "@/lib/validators/projects";
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

    const body = await req.json();
    const result = createMilestoneSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error.format() }, { status: 400 });
    }

    const milestone = await ProjectService.createMilestone(
      result.data,
      organizationId
    );

    return NextResponse.json(milestone, { status: 201 });
  } catch (error) {
    console.error("POST milestone error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

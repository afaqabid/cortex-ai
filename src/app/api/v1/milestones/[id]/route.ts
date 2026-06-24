import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { ProjectService } from "@/services/project.service";
import { getOrCreateActiveOrgId } from "@/lib/auth-server";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
    const body = await req.json();
    const milestone = await ProjectService.updateMilestone(id, body, organizationId);

    return NextResponse.json(milestone);
  } catch (error: any) {
    console.error("PUT milestone error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
    await ProjectService.deleteMilestone(id, organizationId);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("DELETE milestone error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}

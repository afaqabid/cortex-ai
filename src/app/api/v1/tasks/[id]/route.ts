import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { ProjectService } from "@/services/project.service";
import { updateTaskSchema } from "@/lib/validators/projects";
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
    const result = updateTaskSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error.format() }, { status: 400 });
    }

    const task = await ProjectService.updateTask(id, result.data, organizationId);
    return NextResponse.json(task);
  } catch (error) {
    console.error("PUT task error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
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
    await ProjectService.deleteTask(id, organizationId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE task error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

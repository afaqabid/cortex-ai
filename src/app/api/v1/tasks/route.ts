import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { ProjectService } from "@/services/project.service";
import { createTaskSchema } from "@/lib/validators/projects";
import { getOrCreateActiveOrgId } from "@/lib/auth-server";

export async function GET(req: NextRequest) {
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

    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get("projectId") || undefined;

    const tasks = await ProjectService.getTasks(organizationId, projectId);
    return NextResponse.json(tasks);
  } catch (error) {
    console.error("GET tasks error:", error);
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
    const result = createTaskSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error.format() }, { status: 400 });
    }

    const task = await ProjectService.createTask(
      {
        ...result.data,
        createdById: session.user.id,
      },
      organizationId
    );

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.error("POST task error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

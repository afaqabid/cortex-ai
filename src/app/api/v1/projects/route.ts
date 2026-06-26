import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { ProjectService } from "@/services/project.service";
import { createProjectSchema } from "@/lib/validators/projects";
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

    const projects = await ProjectService.getProjects(organizationId);
    return NextResponse.json(projects);
  } catch (error) {
    console.error("GET projects error:", error);
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
    const result = createProjectSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error.format() }, { status: 400 });
    }

    const project = await ProjectService.createProject(
      {
        ...result.data,
        createdById: result.data.createdById || session.user.id,
      },
      organizationId
    );

    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    console.error("POST project error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

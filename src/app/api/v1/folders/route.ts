import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { FileService } from "@/services/file.service";
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
    const parentId = searchParams.get("parentId") || null;

    const folders = await FileService.getFolders(organizationId, parentId);
    return NextResponse.json(folders);
  } catch (error) {
    console.error("GET folders error:", error);
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
    const { name, parentId } = body;

    if (!name) {
      return NextResponse.json({ error: "Folder name is required" }, { status: 400 });
    }

    const folder = await FileService.createFolder(name, parentId || null, organizationId);
    return NextResponse.json(folder, { status: 201 });
  } catch (error) {
    console.error("POST folder error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

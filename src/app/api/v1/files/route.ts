import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { FileService } from "@/services/file.service";
import { getOrCreateActiveOrgId } from "@/lib/auth-server";
import fs from "fs";
import path from "path";

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
    const folderId = searchParams.get("folderId") || null;

    const files = await FileService.getFiles(organizationId, folderId);
    return NextResponse.json(files);
  } catch (error) {
    console.error("GET files error:", error);
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

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const folderId = formData.get("folderId") as string | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadDir = path.join(process.cwd(), "public", "uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const uniqueName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
    const filePath = path.join(uploadDir, uniqueName);
    await fs.promises.writeFile(filePath, buffer);

    const fileUrl = `/uploads/${uniqueName}`;

    const newFile = await FileService.createFile(
      {
        name: file.name,
        url: fileUrl,
        size: file.size,
        mimeType: file.type || "application/octet-stream",
        folderId: folderId || null,
        uploadedById: session.user.id,
      },
      organizationId
    );

    return NextResponse.json(newFile, { status: 201 });
  } catch (error) {
    console.error("POST file error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

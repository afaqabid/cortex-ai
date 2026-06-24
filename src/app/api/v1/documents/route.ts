import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { DocumentService } from "@/services/document.service";
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
    const categoryId = searchParams.get("categoryId") || undefined;
    const search = searchParams.get("search") || undefined;

    const docs = await DocumentService.getDocuments(organizationId, categoryId, search);
    return NextResponse.json(docs);
  } catch (error) {
    console.error("GET documents error:", error);
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
    const { title, content, categoryId, isPublished } = body;

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    const doc = await DocumentService.createDocument(
      {
        title,
        content,
        categoryId,
        isPublished,
        createdById: session.user.id,
      },
      organizationId
    );

    return NextResponse.json(doc, { status: 201 });
  } catch (error) {
    console.error("POST document error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
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
    const q = searchParams.get("q") || "";

    if (!q.trim()) {
      return NextResponse.json({
        leads: [],
        projects: [],
        invoices: [],
        documents: [],
      });
    }

    const [leads, projects, invoices, documents] = await Promise.all([
      prisma.lead.findMany({
        where: {
          organizationId,
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { company: { contains: q, mode: "insensitive" } },
          ],
        },
        take: 3,
      }),
      prisma.project.findMany({
        where: {
          organizationId,
          name: { contains: q, mode: "insensitive" },
        },
        take: 3,
      }),
      prisma.invoice.findMany({
        where: {
          organizationId,
          number: { contains: q, mode: "insensitive" },
        },
        take: 3,
      }),
      prisma.document.findMany({
        where: {
          organizationId,
          title: { contains: q, mode: "insensitive" },
        },
        take: 3,
      }),
    ]);

    return NextResponse.json({ leads, projects, invoices, documents });
  } catch (error) {
    console.error("GET search error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

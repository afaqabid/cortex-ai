import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { InvoiceService } from "@/services/invoice.service";
import { getOrCreateActiveOrgId } from "@/lib/auth-server";

export async function POST(
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
    const result = await InvoiceService.sendInvoiceEmail(id, organizationId);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("POST send invoice error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}

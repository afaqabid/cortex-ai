import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { InvoiceService } from "@/services/invoice.service";
import { createInvoiceSchema } from "@/lib/validators/invoices";
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

    const invoices = await InvoiceService.getInvoices(organizationId);
    return NextResponse.json(invoices);
  } catch (error) {
    console.error("GET invoices error:", error);
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
    const result = createInvoiceSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error.format() }, { status: 400 });
    }

    const invoice = await InvoiceService.createInvoice(
      {
        ...result.data,
        createdById: session.user.id,
      },
      organizationId
    );

    return NextResponse.json(invoice, { status: 201 });
  } catch (error) {
    console.error("POST invoice error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

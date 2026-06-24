import { prisma } from "@/lib/prisma";
import { CreateInvoiceInput } from "@/lib/validators/invoices";
import { InvoiceStatus } from "@prisma/client";
import { generateInvoicePDF } from "@/lib/pdf-generator";

export class InvoiceService {
  static async getInvoices(organizationId: string) {
    return await prisma.invoice.findMany({
      where: { organizationId },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            company: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  static async getInvoiceById(id: string, organizationId: string) {
    return await prisma.invoice.findFirst({
      where: { id, organizationId },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            company: true,
            address: true,
          },
        },
        items: true,
        createdBy: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  static async createInvoice(
    data: CreateInvoiceInput & { createdById: string },
    organizationId: string
  ) {
    // Generate sequential or unique invoice number
    const count = await prisma.invoice.count({
      where: { organizationId },
    });
    const year = new Date().getFullYear();
    const formattedNumber = `INV-${year}-${(count + 1).toString().padStart(4, "0")}`;

    // Calculate item amounts
    const itemsData = data.items.map((item) => {
      const amount = Number((item.quantity * item.rate).toFixed(2));
      return {
        description: item.description,
        quantity: item.quantity,
        rate: item.rate,
        amount,
      };
    });

    const subtotal = Number(itemsData.reduce((sum, item) => sum + item.amount, 0).toFixed(2));
    const taxAmount = Number(((subtotal * (data.tax || 0)) / 100).toFixed(2));
    const discountAmount = Number((data.discount || 0).toFixed(2));
    const total = Number((subtotal + taxAmount - discountAmount).toFixed(2));

    return await prisma.invoice.create({
      data: {
        number: formattedNumber,
        status: "DRAFT",
        dueDate: new Date(data.dueDate),
        currency: data.currency || "USD",
        notes: data.notes || null,
        terms: data.terms || null,
        subtotal,
        tax: data.tax || 0,
        discount: data.discount || 0,
        total,
        organizationId,
        clientId: data.clientId,
        createdById: data.createdById,
        items: {
          create: itemsData,
        },
      },
    });
  }

  static async updateInvoiceStatus(
    id: string,
    status: InvoiceStatus,
    paidAmount: number | undefined,
    organizationId: string
  ) {
    const invoice = await prisma.invoice.findFirst({
      where: { id, organizationId },
    });

    if (!invoice) throw new Error("Invoice not found");

    return await prisma.invoice.update({
      where: { id },
      data: {
        status,
        paidAt: status === "PAID" ? new Date() : undefined,
        paidAmount: status === "PAID" ? invoice.total : paidAmount !== undefined ? paidAmount : undefined,
      },
    });
  }

  static async deleteInvoice(id: string, organizationId: string) {
    const invoice = await prisma.invoice.findFirst({
      where: { id, organizationId },
    });

    if (!invoice) throw new Error("Invoice not found");
    if (invoice.status !== "DRAFT" && invoice.status !== "CANCELLED") {
      throw new Error("Only draft or cancelled invoices can be deleted");
    }

    return await prisma.invoice.delete({
      where: { id },
    });
  }

  static async sendInvoiceEmail(id: string, organizationId: string) {
    const invoice = await this.getInvoiceById(id, organizationId);
    if (!invoice) throw new Error("Invoice not found");
    if (!invoice.client?.email) throw new Error("Client email is not configured");

    const clientEmail = invoice.client.email;
    const invoiceNumber = invoice.number;
    const invoiceTotal = invoice.total;
    const currencySymbol = invoice.currency === "USD" ? "$" : invoice.currency === "EUR" ? "€" : "£";

    const emailSubject = `Invoice ${invoiceNumber} from Cortex AI`;
    const emailHtml = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 25px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff; color: #1e293b;">
<table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
  <tr>
    <td style="vertical-align: top;">
      <div
        style="
          color: #6366f1;
          font-size: 18px;
          font-weight: 800;
          line-height: 1.2;
          margin: 0;
        "
      >
        CORTEX AI
      </div>

      <div
        style="
          font-size: 10px;
          color: #64748b;
          margin-top: 4px;
        "
      >
        Enterprise Operating System
      </div>
    </td>

    <td
      style="
        text-align: right;
        vertical-align: top;
        white-space: nowrap;
      "
    >
      <div
        style="
          font-size: 12px;
          font-weight: 700;
          color: #111827;
        "
      >
        ${invoiceNumber}
      </div>
    </td>
  </tr>
</table>

<hr style="border: none; border-top: 1px solid #e5e7eb; margin: 0;" />

        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 15px 0;" />

        <div style="margin-bottom: 20px;">
          <table style="width: 100%; border-collapse: collapse; font-size: 12px; line-height: 1.4;">
            <tr>
              <td style="width: 50%; vertical-align: top; padding-right: 15px; color: #334155;">
                <span style="display: block; font-size: 10px; font-weight: bold; color: #64748b; text-transform: uppercase; margin-bottom: 4px;">Billed To</span>
                <strong>${invoice.client.company || "No Company"}</strong><br />
                ${invoice.client.name}<br />
                ${invoice.client.email || ""}<br />
                ${invoice.client.phone || ""}<br />
                ${invoice.client.address || ""}
              </td>
              <td style="width: 50%; vertical-align: top; text-align: right; color: #334155;">
                <span style="display: block; font-size: 10px; font-weight: bold; color: #64748b; text-transform: uppercase; margin-bottom: 4px;">Details</span>
                <strong>Date Issued:</strong> ${new Date(invoice.issueDate).toLocaleDateString()}<br />
                <strong>Due Date:</strong> <span style="color: #ef4444; font-weight: bold;">${new Date(invoice.dueDate).toLocaleDateString()}</span>
              </td>
            </tr>
          </table>
        </div>

        <div style="margin-bottom: 20px;">
          <table style="width: 100%; border-collapse: collapse; font-size: 12px; text-align: left;">
            <thead>
              <tr style="border-bottom: 2px solid #e2e8f0; color: #64748b; font-weight: bold; text-transform: uppercase; font-size: 9px; tracking-wider: 0.05em;">
                <th style="padding: 6px 4px;">Description</th>
                <th style="padding: 6px 4px; text-align: center; width: 50px;">Qty</th>
                <th style="padding: 6px 4px; text-align: right; width: 80px;">Rate</th>
                <th style="padding: 6px 4px; text-align: right; width: 90px;">Amount</th>
              </tr>
            </thead>
            <tbody style="color: #334155;">
              ${invoice.items.map(item => `
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 8px 4px; font-weight: 600;">${item.description}</td>
                  <td style="padding: 8px 4px; text-align: center;">${item.quantity}</td>
                  <td style="padding: 8px 4px; text-align: right;">${currencySymbol}${item.rate.toFixed(2)}</td>
                  <td style="padding: 8px 4px; text-align: right;">${currencySymbol}${item.amount.toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <div style="margin-bottom: 20px;">
          <table style="width: 220px; border-collapse: collapse; font-size: 12px; margin-left: auto; color: #334155;">
            <tr>
              <td style="padding: 3px 0; color: #64748b;">Subtotal:</td>
              <td style="padding: 3px 0; text-align: right;">${currencySymbol}${invoice.subtotal.toFixed(2)}</td>
            </tr>
            ${invoice.tax > 0 ? `
              <tr>
                <td style="padding: 3px 0; color: #64748b;">Tax (${invoice.tax}%):</td>
                <td style="padding: 3px 0; text-align: right;">${currencySymbol}${((invoice.subtotal * invoice.tax) / 100).toFixed(2)}</td>
              </tr>
            ` : ''}
            ${invoice.discount > 0 ? `
              <tr>
                <td style="padding: 3px 0; color: #ef4444;">Discount:</td>
                <td style="padding: 3px 0; text-align: right; color: #ef4444;">-${currencySymbol}${invoice.discount.toFixed(2)}</td>
              </tr>
            ` : ''}
            <tr style="border-top: 1px solid #e2e8f0; font-weight: bold; font-size: 13px;">
              <td style="padding: 8px 0 0 0;">Total Due:</td>
              <td style="padding: 8px 0 0 0; text-align: right; color: #6366f1;">
                ${currencySymbol}${invoice.total.toFixed(2)} ${invoice.currency}
              </td>
            </tr>
          </table>
        </div>

        ${(invoice.notes || invoice.terms) ? `
          <div style="border-top: 1px solid #e2e8f0; padding-top: 15px; font-size: 11px; color: #64748b; line-height: 1.4;">
            ${invoice.notes ? `<p style="margin: 0 0 8px 0;"><strong>Notes:</strong> ${invoice.notes}</p>` : ''}
            ${invoice.terms ? `<p style="margin: 0;"><strong>Terms:</strong> ${invoice.terms}</p>` : ''}
          </div>
        ` : ''}

        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0 15px 0;" />
        <p style="font-size: 10px; color: #94a3b8; text-align: center; margin: 0;">
          This message was sent automatically by Cortex AI Invoicing.
        </p>
      </div>
    `;





    const apiKey = process.env.RESEND_API_KEY;

    // Generate PDF buffer
    const pdfBuffer = await generateInvoicePDF(invoice).catch((err) => {
      console.error("PDF generation failed:", err);
      return null;
    });

    const attachments = [];
    if (pdfBuffer) {
      attachments.push({
        content: pdfBuffer.toString("base64"),
        filename: `${invoiceNumber}.pdf`,
      });
    }

    if (!apiKey) {
      console.log("=== MOCK EMAIL SENDING ===");
      console.log(`To: ${clientEmail}`);
      console.log(`Subject: ${emailSubject}`);
      console.log(`Body:\n${emailHtml}`);
      console.log(`Attachment: ${pdfBuffer ? `${invoiceNumber}.pdf generated` : "none"}`);
      console.log("==========================");

      // Update invoice status to SENT if it was in DRAFT
      if (invoice.status === "DRAFT") {
        await prisma.invoice.update({
          where: { id },
          data: { status: "SENT" },
        });
      }

      return { success: true, mocked: true };
    }

    // Call Resend REST API
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev",
        to: [clientEmail],
        subject: emailSubject,
        html: emailHtml,
        attachments,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Resend API error: ${errorText}`);
    }

    // Update status to SENT if it was DRAFT
    if (invoice.status === "DRAFT") {
      await prisma.invoice.update({
        where: { id },
        data: { status: "SENT" },
      });
    }

    return { success: true, mocked: false };
  }
}

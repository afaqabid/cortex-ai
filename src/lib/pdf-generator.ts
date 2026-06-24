import fs from "fs";
import path from "path";
import PDFDocument from "pdfkit";

async function getFontBuffer(): Promise<Buffer> {
  const fontPath = path.join(process.cwd(), "public", "fonts", "Roboto-Regular.ttf");
  const fontDir = path.dirname(fontPath);

  if (!fs.existsSync(fontDir)) {
    fs.mkdirSync(fontDir, { recursive: true });
  }

  if (fs.existsSync(fontPath)) {
    return await fs.promises.readFile(fontPath);
  }

  try {
    const res = await fetch("https://raw.githubusercontent.com/google/fonts/main/ofl/roboto/Roboto-Regular.ttf");
    if (!res.ok) throw new Error("Failed to download font");
    const buffer = Buffer.from(await res.arrayBuffer());
    await fs.promises.writeFile(fontPath, buffer);
    return buffer;
  } catch (err) {
    console.error("Font download failed, returning empty buffer:", err);
    throw err;
  }
}

async function getBoldFontBuffer(): Promise<Buffer> {
  const fontPath = path.join(process.cwd(), "public", "fonts", "Roboto-Bold.ttf");
  const fontDir = path.dirname(fontPath);

  if (!fs.existsSync(fontDir)) {
    fs.mkdirSync(fontDir, { recursive: true });
  }

  if (fs.existsSync(fontPath)) {
    return await fs.promises.readFile(fontPath);
  }

  try {
    const res = await fetch("https://raw.githubusercontent.com/google/fonts/main/ofl/roboto/Roboto-Bold.ttf");
    if (!res.ok) throw new Error("Failed to download bold font");
    const buffer = Buffer.from(await res.arrayBuffer());
    await fs.promises.writeFile(fontPath, buffer);
    return buffer;
  } catch (err) {
    console.error("Bold font download failed:", err);
    throw err;
  }
}

export async function generateInvoicePDF(invoice: any): Promise<Buffer> {
  // Load fonts first
  const [regularFont, boldFont] = await Promise.all([
    getFontBuffer(),
    getBoldFontBuffer()
  ]);

  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const chunks: Buffer[] = [];

      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", (err) => reject(err));

      // Register and set custom fonts to avoid standard Helvetica afm file ENOENT issues
      doc.registerFont("Roboto", regularFont);
      doc.registerFont("Roboto-Bold", boldFont);

      // Header Brand
      doc.fillColor("#6366f1").font("Roboto-Bold").fontSize(20).text("CORTEX AI", { align: "left" });
      doc.fillColor("#64748b").font("Roboto").fontSize(10).text("Enterprise Business Operating System", { align: "left" });
      doc.moveDown();

      // Invoice status and number
      doc.fillColor("#1e293b").font("Roboto-Bold").fontSize(14).text(`Invoice Number: ${invoice.number}`, { align: "right" });
      doc.font("Roboto").fontSize(10).text(`Status: ${invoice.status}`, { align: "right" });
      doc.moveDown(2);

      // Client info and details
      const yPos = doc.y;
      doc.fillColor("#64748b").fontSize(10).text("Billed To:", 50, yPos);
      doc.fillColor("#1e293b").font("Roboto-Bold").fontSize(11).text(invoice.client?.company || "No Company", 50, yPos + 15);
      doc.font("Roboto").fontSize(10).text(invoice.client?.name || "", 50, yPos + 30);
      doc.fontSize(10).text(invoice.client?.email || "", 50, yPos + 45);

      doc.fillColor("#64748b").fontSize(10).text("Invoice Details:", 350, yPos);
      doc.fillColor("#1e293b").fontSize(10).text(`Date Issued: ${new Date(invoice.issueDate).toLocaleDateString()}`, 350, yPos + 15);
      doc.fontSize(10).text(`Due Date: ${new Date(invoice.dueDate).toLocaleDateString()}`, 350, yPos + 30);
      doc.moveDown(4);

      // Items Table Header
      let currentY = doc.y + 40;
      doc.fillColor("#64748b").fontSize(10);
      doc.text("Description", 50, currentY);
      doc.text("Qty", 300, currentY, { width: 50, align: "center" });
      doc.text("Rate", 370, currentY, { width: 80, align: "right" });
      doc.text("Amount", 470, currentY, { width: 90, align: "right" });

      doc.moveTo(50, currentY + 15).lineTo(560, currentY + 15).strokeColor("#cbd5e1").stroke();
      currentY += 20;

      // Table lines
      doc.fillColor("#1e293b");
      invoice.items.forEach((item: any) => {
        doc.text(item.description, 50, currentY);
        doc.text(item.quantity.toString(), 300, currentY, { width: 50, align: "center" });
        doc.text(`$${item.rate.toFixed(2)}`, 370, currentY, { width: 80, align: "right" });
        doc.text(`$${item.amount.toFixed(2)}`, 470, currentY, { width: 90, align: "right" });
        currentY += 20;
      });

      doc.moveTo(50, currentY).lineTo(560, currentY).strokeColor("#f1f5f9").stroke();
      currentY += 15;

      // Totals
      doc.text("Subtotal:", 350, currentY, { width: 100, align: "right" });
      doc.text(`$${invoice.subtotal.toFixed(2)}`, 470, currentY, { width: 90, align: "right" });
      currentY += 15;

      if (invoice.tax > 0) {
        doc.text(`Tax (${invoice.tax}%):`, 350, currentY, { width: 100, align: "right" });
        doc.text(`$${((invoice.subtotal * invoice.tax) / 100).toFixed(2)}`, 470, currentY, { width: 90, align: "right" });
        currentY += 15;
      }

      if (invoice.discount > 0) {
        doc.text("Discount:", 350, currentY, { width: 100, align: "right" });
        doc.text(`-$${invoice.discount.toFixed(2)}`, 470, currentY, { width: 90, align: "right" });
        currentY += 15;
      }

      doc.fontSize(12).fillColor("#6366f1").font("Roboto-Bold");
      doc.text("Total Due:", 350, currentY, { width: 100, align: "right" });
      doc.text(`$${invoice.total.toFixed(2)}`, 470, currentY, { width: 90, align: "right" });

      // Notes
      if (invoice.notes || invoice.terms) {
        doc.moveDown(4);
        doc.fillColor("#64748b").font("Roboto").fontSize(9);
        if (invoice.notes) doc.text(`Notes: ${invoice.notes}`);
        if (invoice.terms) doc.text(`Terms: ${invoice.terms}`);
      }

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

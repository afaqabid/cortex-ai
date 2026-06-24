import { generateInvoicePDF } from "./src/lib/pdf-generator";

const mockInvoice = {
  number: "INV-2026-0001",
  status: "DRAFT",
  issueDate: new Date(),
  dueDate: new Date(),
  currency: "USD",
  subtotal: 100,
  tax: 10,
  discount: 5,
  total: 105,
  items: [
    {
      description: "Test Item",
      quantity: 1,
      rate: 100,
      amount: 100,
    }
  ],
  client: {
    name: "John Doe",
    company: "Test Company",
    email: "john@example.com",
  }
};

async function test() {
  try {
    console.log("Generating PDF...");
    const pdf = await generateInvoicePDF(mockInvoice);
    console.log("Success! PDF size:", pdf.length);
  } catch (err) {
    console.error("Failed to generate PDF:", err);
  }
}

test();

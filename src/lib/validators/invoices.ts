import { z } from "zod";

export const createInvoiceSchema = z.object({
  clientId: z.string().min(1, "Client is required"),
  dueDate: z.string().min(1, "Due date is required"),
  currency: z.string().default("USD"),
  notes: z.string().optional(),
  terms: z.string().optional(),
  tax: z.number().min(0).default(0),
  discount: z.number().min(0).default(0),
  items: z
    .array(
      z.object({
        description: z.string().min(1, "Description is required"),
        quantity: z.number().min(0.01, "Quantity must be greater than 0"),
        rate: z.number().min(0, "Rate must be 0 or more"),
      })
    )
    .min(1, "At least one item is required"),
});

export const updateInvoiceSchema = createInvoiceSchema.partial();

export const updateInvoiceStatusSchema = z.object({
  status: z.enum([
    "DRAFT",
    "SENT",
    "VIEWED",
    "PAID",
    "OVERDUE",
    "CANCELLED",
    "REFUNDED",
  ]),
  paidAmount: z.number().min(0).optional(),
});

export type CreateInvoiceInput = z.infer<typeof createInvoiceSchema>;
export type UpdateInvoiceInput = z.infer<typeof updateInvoiceSchema>;
export type UpdateInvoiceStatusInput = z.infer<
  typeof updateInvoiceStatusSchema
>;

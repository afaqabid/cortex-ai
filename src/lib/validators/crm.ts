import { z } from "zod";

export const createLeadSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().optional(),
  company: z.string().optional(),
  title: z.string().optional(),
  source: z.enum([
    "WEBSITE",
    "REFERRAL",
    "SOCIAL",
    "EMAIL",
    "COLD_CALL",
    "ADVERTISEMENT",
    "OTHER",
  ]),
  value: z.number().min(0).optional(),
  notes: z.string().optional(),
  assignedToId: z.string().optional(),
  pipelineStageId: z.string().optional(),
});

export const updateLeadSchema = createLeadSchema.partial().extend({
  status: z
    .enum([
      "NEW",
      "CONTACTED",
      "QUALIFIED",
      "PROPOSAL",
      "NEGOTIATION",
      "WON",
      "LOST",
    ])
    .optional(),
  score: z.number().min(0).max(100).optional(),
});

export const createContactSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().optional(),
  title: z.string().optional(),
  company: z.string().optional(),
  address: z.string().optional(),
  notes: z.string().optional(),
  leadId: z.string().optional(),
  clientId: z.string().optional(),
});

export const createPipelineSchema = z.object({
  name: z.string().min(1, "Pipeline name is required"),
  description: z.string().optional(),
  stages: z
    .array(
      z.object({
        name: z.string().min(1, "Stage name is required"),
        color: z.string().optional(),
        order: z.number(),
      })
    )
    .min(1, "At least one stage is required"),
});

export type CreateLeadInput = z.infer<typeof createLeadSchema>;
export type UpdateLeadInput = z.infer<typeof updateLeadSchema>;
export type CreateContactInput = z.infer<typeof createContactSchema>;
export type CreatePipelineInput = z.infer<typeof createPipelineSchema>;

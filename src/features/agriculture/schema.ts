import { z } from "zod";

export const agriculturePayloadSchema = z.object({
  agricultureRole: z.enum(["farmer", "input-supplier"]),
  contactName: z.string().trim().min(2).max(120),
  contactPhone: z.string().trim().min(7).max(40),
  contactEmail: z.string().trim().email().max(254),
  farmLocation: z.string().trim().min(2).max(200),
  cropTypes: z.array(z.string()).optional(),
  animalTypes: z.array(z.string()).optional(),
  inputSupplierType: z.array(z.string()).optional(),
  serviceType: z.string().trim().min(1).max(80),
  inputsNeeded: z.string().trim().max(2000).optional(),
  timeline: z.string().trim().min(1).max(80),
  budgetRange: z.string().trim().max(160).optional(),
  additionalNotes: z.string().trim().max(3000).optional(),
});

export type AgriculturePayload = z.infer<typeof agriculturePayloadSchema>;

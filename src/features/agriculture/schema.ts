import { z } from "zod";

export const agriculturePayloadSchema = z.object({
  contactName: z.string().trim().min(2).max(120),
  contactPhone: z.string().trim().min(7).max(40),
  contactEmail: z.string().trim().email().max(254),
  farmLocation: z.string().trim().min(2).max(200),
  farmSize: z.string().trim().min(1).max(120),
  serviceType: z.string().trim().min(1).max(80),
  cropOrLivestock: z.string().trim().min(2).max(200),
  quantity: z.string().trim().min(1).max(160),
  timeline: z.string().trim().min(1).max(80),
  budgetRange: z.string().trim().max(160).optional(),
  inputsNeeded: z.string().trim().max(2000).optional(),
  buyerPreferences: z.string().trim().max(2000).optional(),
  additionalNotes: z.string().trim().max(3000).optional(),
});

export type AgriculturePayload = z.infer<typeof agriculturePayloadSchema>;

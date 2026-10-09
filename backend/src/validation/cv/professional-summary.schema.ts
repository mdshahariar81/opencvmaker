import { z } from "zod";

/**
 * Professional Summary validation.
 *
 * Matches the ProfessionalSummary database model.
 */
export const professionalSummarySchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, "Professional summary is required")
    .max(
      5000,
      "Professional summary must not exceed 5000 characters",
    ),

  isVisible: z
    .boolean()
    .optional(),
});

export type ProfessionalSummaryInput =
  z.infer<typeof professionalSummarySchema>;
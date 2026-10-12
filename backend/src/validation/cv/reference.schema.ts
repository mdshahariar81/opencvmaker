import { z } from "zod";

/**
 * Reference validation.
 *
 * Matches the Reference Prisma model.
 * Used for professional, academic, and personal references
 * listed on a CV.
 */
export const referenceSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Reference name is required")
    .max(300, "Reference name must not exceed 300 characters"),

  position: z
    .string()
    .trim()
    .max(200, "Position must not exceed 200 characters")
    .optional(),

  company: z
    .string()
    .trim()
    .max(300, "Company name must not exceed 300 characters")
    .optional(),

  type: z
    .enum(["PROFESSIONAL", "ACADEMIC", "PERSONAL"])
    .optional(),

  email: z
    .string()
    .trim()
    .email("Please provide a valid reference email")
    .optional(),

  phone: z
    .string()
    .trim()
    .max(50, "Phone number must not exceed 50 characters")
    .optional(),

  relationship: z
    .string()
    .trim()
    .max(300, "Relationship must not exceed 300 characters")
    .optional(),

  website: z
    .string()
    .trim()
    .url("Please provide a valid reference website URL")
    .optional(),

  description: z
    .string()
    .trim()
    .max(5000, "Reference description must not exceed 5000 characters")
    .optional(),

  sortOrder: z
    .number()
    .int()
    .min(0)
    .optional(),
});

export type ReferenceInput = z.infer<typeof referenceSchema>;

export const referenceIdParamSchema = z.object({
  referenceId: z
    .string()
    .trim()
    .min(1, "Reference ID is required"),
});

export type ReferenceIdParam = z.infer<typeof referenceIdParamSchema>;

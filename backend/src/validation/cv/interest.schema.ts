import { z } from "zod";

/**
 * Interest validation.
 *
 * Matches the Interest Prisma model.
 * Used for personal/professional interests listed on a CV.
 */
export const interestSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Interest name is required")
    .max(300, "Interest name must not exceed 300 characters"),

  description: z
    .string()
    .trim()
    .max(5000, "Interest description must not exceed 5000 characters")
    .optional(),

  sortOrder: z
    .number()
    .int()
    .min(0)
    .optional(),
});

export type InterestInput = z.infer<typeof interestSchema>;

export const interestIdParamSchema = z.object({
  interestId: z
    .string()
    .trim()
    .min(1, "Interest ID is required"),
});

export type InterestIdParam = z.infer<typeof interestIdParamSchema>;

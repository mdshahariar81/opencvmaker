import { z } from "zod";

/**
 * Patent validation.
 *
 * Matches the Patent Prisma model.
 * Used for patents and intellectual property
 * listed on a CV.
 */
export const patentSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Patent title is required")
    .max(
      500,
      "Patent title must not exceed 500 characters",
    ),

  patentNumber: z
    .string()
    .trim()
    .max(
      200,
      "Patent number must not exceed 200 characters",
    )
    .optional(),

  inventors: z
    .string()
    .trim()
    .max(
      1000,
      "Inventors must not exceed 1000 characters",
    )
    .optional(),

  issuer: z
    .string()
    .trim()
    .max(
      300,
      "Patent issuer must not exceed 300 characters",
    )
    .optional(),

  filingDate: z
    .string()
    .datetime()
    .optional(),

  issueDate: z
    .string()
    .datetime()
    .optional(),

  status: z
    .string()
    .trim()
    .max(
      100,
      "Patent status must not exceed 100 characters",
    )
    .optional(),

  url: z
    .string()
    .trim()
    .url("Please provide a valid patent URL")
    .optional(),

  description: z
    .string()
    .trim()
    .max(
      5000,
      "Patent description must not exceed 5000 characters",
    )
    .optional(),

  sortOrder: z
    .number()
    .int()
    .min(0)
    .optional(),
});

export type PatentInput = z.infer<typeof patentSchema>;

/**
 * Validates the ID of a patent record.
 */
export const patentIdParamSchema = z.object({
  patentId: z
    .string()
    .trim()
    .min(1, "Patent ID is required"),
});

export type PatentIdParam = z.infer<
  typeof patentIdParamSchema
>;

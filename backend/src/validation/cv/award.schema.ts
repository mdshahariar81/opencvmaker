import { z } from "zod";

/**
 * Award validation.
 *
 * Matches the Award database model.
 */
export const awardSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Award title is required")
    .max(
      200,
      "Award title must not exceed 200 characters",
    ),

  issuer: z
    .string()
    .trim()
    .max(
      200,
      "Award issuer must not exceed 200 characters",
    )
    .optional(),

  date: z
    .string()
    .datetime()
    .optional(),

  description: z
    .string()
    .trim()
    .max(
      5000,
      "Award description must not exceed 5000 characters",
    )
    .optional(),

  url: z
    .string()
    .trim()
    .url("Please provide a valid award URL")
    .optional(),

  sortOrder: z
    .number()
    .int()
    .min(0)
    .optional(),
});

export type AwardInput =
  z.infer<typeof awardSchema>;

export const awardIdParamSchema = z.object({
  awardId: z
    .string()
    .trim()
    .min(1, "Award ID is required"),
});

export type AwardIdParam =
  z.infer<typeof awardIdParamSchema>;

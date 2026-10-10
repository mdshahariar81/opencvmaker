import { z } from "zod";

/**
 * Publication validation.
 *
 * Matches the Publication database model.
 */
export const publicationSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Publication title is required")
    .max(
      500,
      "Publication title must not exceed 500 characters",
    ),

  authors: z
    .string()
    .trim()
    .max(
      1000,
      "Authors must not exceed 1000 characters",
    )
    .optional(),

  publisher: z
    .string()
    .trim()
    .max(
      300,
      "Publisher must not exceed 300 characters",
    )
    .optional(),

  publicationDate: z
    .string()
    .datetime()
    .optional(),

  journal: z
    .string()
    .trim()
    .max(
      300,
      "Journal name must not exceed 300 characters",
    )
    .optional(),

  volume: z
    .string()
    .trim()
    .max(
      100,
      "Volume must not exceed 100 characters",
    )
    .optional(),

  issue: z
    .string()
    .trim()
    .max(
      100,
      "Issue must not exceed 100 characters",
    )
    .optional(),

  pages: z
    .string()
    .trim()
    .max(
      100,
      "Pages must not exceed 100 characters",
    )
    .optional(),

  doi: z
    .string()
    .trim()
    .max(
      300,
      "DOI must not exceed 300 characters",
    )
    .optional(),

  url: z
    .string()
    .trim()
    .url("Please provide a valid publication URL")
    .optional(),

  description: z
    .string()
    .trim()
    .max(
      5000,
      "Publication description must not exceed 5000 characters",
    )
    .optional(),

  sortOrder: z
    .number()
    .int()
    .min(0)
    .optional(),
});

export type PublicationInput =
  z.infer<typeof publicationSchema>;

export const publicationIdParamSchema = z.object({
  publicationId: z
    .string()
    .trim()
    .min(1, "Publication ID is required"),
});

export type PublicationIdParam =
  z.infer<typeof publicationIdParamSchema>;

import { z } from "zod";

/**
 * Public CV slug validation.
 *
 * Example:
 * shahariar-hossen
 * software-engineer-cv
 * frontend-developer-2026
 */
export const publicCVSlugSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(3, "Public CV slug must be at least 3 characters")
    .max(100, "Public CV slug must not exceed 100 characters")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Public CV slug can only contain lowercase letters, numbers, and hyphens",
    ),
});

export type PublicCVSlugInput = z.infer<
  typeof publicCVSlugSchema
>;

/**
 * Public CV settings update schema.
 *
 * Controls whether the CV is publicly accessible.
 */
export const updateCVPublicSchema = z.object({
  isPublic: z.boolean(),
  slug: publicCVSlugSchema.shape.slug.optional(),
});

export type UpdateCVPublicInput = z.infer<
  typeof updateCVPublicSchema
>;

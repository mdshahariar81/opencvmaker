import { z } from "zod";

/**
 * Custom section validation.
 *
 * Matches the CustomSection Prisma model.
 * The content field intentionally accepts flexible JSON so users
 * can create their own CV section structures.
 */
export const customSectionSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Custom section title is required")
    .max(300, "Custom section title must not exceed 300 characters"),

  description: z
    .string()
    .trim()
    .max(
      5000,
      "Custom section description must not exceed 5000 characters",
    )
    .optional(),

  content: z.record(z.string(), z.unknown()),

  sortOrder: z
    .number()
    .int()
    .min(0)
    .optional(),

  isVisible: z
    .boolean()
    .optional(),
});

export type CustomSectionInput = z.infer<typeof customSectionSchema>;

export const customSectionIdParamSchema = z.object({
  customSectionId: z
    .string()
    .trim()
    .min(1, "Custom section ID is required"),
});

export type CustomSectionIdParam =
  z.infer<typeof customSectionIdParamSchema>;

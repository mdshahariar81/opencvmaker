import { z } from "zod";

/**
 * Language validation.
 *
 * Matches the Language database model.
 */
export const languageSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Language name is required")
    .max(
      100,
      "Language name must not exceed 100 characters",
    ),

  level: z
    .string()
    .trim()
    .max(
      100,
      "Language level must not exceed 100 characters",
    )
    .optional(),

  sortOrder: z
    .number()
    .int()
    .min(0)
    .optional(),
});

export type LanguageInput =
  z.infer<typeof languageSchema>;

export const languageIdParamSchema = z.object({
  languageId: z
    .string()
    .trim()
    .min(1, "Language ID is required"),
});

export type LanguageIdParam =
  z.infer<typeof languageIdParamSchema>;

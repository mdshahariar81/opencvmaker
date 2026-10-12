import { z } from "zod";

/**
 * CV section setting validation.
 *
 * Controls whether a CV section is visible and
 * where it appears in the CV section order.
 */
export const cvSectionSettingSchema = z.object({
  sectionKey: z
    .string()
    .trim()
    .min(1, "Section key is required")
    .max(100, "Section key must not exceed 100 characters"),

  isVisible: z.boolean().optional(),

  sortOrder: z
    .number()
    .int()
    .min(0)
    .optional(),
});

export type CVSectionSettingInput =
  z.infer<typeof cvSectionSettingSchema>;

export const cvSectionSettingIdParamSchema = z.object({
  settingId: z
    .string()
    .trim()
    .min(1, "Section setting ID is required"),
});

export type CVSectionSettingIdParam =
  z.infer<typeof cvSectionSettingIdParamSchema>;

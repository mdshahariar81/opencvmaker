import { z } from "zod";

/**
 * Skill validation schema.
 *
 * Validates skill information before it reaches
 * the service/database layer.
 */
export const skillSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Skill name is required")
    .max(100, "Skill name must not exceed 100 characters"),

  category: z
    .string()
    .trim()
    .max(100, "Skill category must not exceed 100 characters")
    .optional(),

  level: z
    .string()
    .trim()
    .max(100, "Skill level must not exceed 100 characters")
    .optional(),

  sortOrder: z
    .number()
    .int()
    .min(0)
    .optional(),
});

export type SkillInput = z.infer<typeof skillSchema>;

/**
 * Route parameter validation.
 */
export const skillIdParamSchema = z.object({
  skillId: z
    .string()
    .trim()
    .min(1, "Skill ID is required"),
});

export type SkillIdParam = z.infer<
  typeof skillIdParamSchema
>;
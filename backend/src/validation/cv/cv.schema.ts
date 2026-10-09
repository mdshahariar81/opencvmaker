import { z } from "zod";

/**
 * CV creation validation.
 *
 * This validates the basic CV payload before
 * it reaches the CV service/database layer.
 */
export const createCVSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "CV title is required")
    .max(200, "CV title must not exceed 200 characters"),

  templateId: z
    .string()
    .trim()
    .min(1, "Template ID cannot be empty")
    .optional(),

  /**
   * CV content is stored as JSON.
   *
   * Detailed section validation will be added later
   * when the individual CV section APIs are implemented.
   */
  data: z
    .record(z.string(), z.unknown())
    .optional(),
});

/**
 * CV update validation.
 *
 * Every field is optional because PATCH requests
 * only need to send the fields that changed.
 */
export const updateCVSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, "CV title cannot be empty")
      .max(200, "CV title must not exceed 200 characters")
      .optional(),

    templateId: z
      .string()
      .trim()
      .min(1, "Template ID cannot be empty")
      .nullable()
      .optional(),

    data: z
      .record(z.string(), z.unknown())
      .optional(),

    status: z.enum([
      "DRAFT",
      "PUBLISHED",
      "ARCHIVED",
    ]).optional(),

    visibility: z.enum([
      "PUBLIC",
      "PRIVATE",
    ]).optional(),

    isPublic: z.boolean().optional(),
  })
  .refine(
    (data) => Object.keys(data).length > 0,
    {
      message: "At least one field is required for update",
    },
  );

/**
 * Route parameter validation.
 */
export const cvIdParamSchema = z.object({
  id: z
    .string()
    .trim()
    .min(1, "CV ID is required"),
});

export type CreateCVInput = z.infer<typeof createCVSchema>;
export type UpdateCVInput = z.infer<typeof updateCVSchema>;
export type CVIdParam = z.infer<typeof cvIdParamSchema>;
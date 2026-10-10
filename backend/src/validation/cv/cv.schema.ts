import { z } from "zod";

/**
 * CV creation validation schema.
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

  data: z
    .record(z.string(), z.unknown())
    .optional(),
});

export type CreateCVInput = z.infer<typeof createCVSchema>;

/**
 * CV update validation schema.
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

    status: z
      .enum(["DRAFT", "PUBLISHED", "ARCHIVED"])
      .optional(),

    visibility: z
      .enum(["PUBLIC", "PRIVATE"])
      .optional(),

    isPublic: z
      .boolean()
      .optional(),
  })
  .refine(
    (data) => Object.keys(data).length > 0,
    {
      message: "At least one field is required for update",
    },
  );

export type UpdateCVInput = z.infer<typeof updateCVSchema>;

/**
 * CV route parameter validation.
 *
 * Used by all nested CV section routes:
 * /cvs/:id/...
 */
export const cvIdParamSchema = z.object({
  id: z
    .string()
    .trim()
    .min(1, "CV ID is required"),
});

export type CVIdParam = z.infer<
  typeof cvIdParamSchema
>;
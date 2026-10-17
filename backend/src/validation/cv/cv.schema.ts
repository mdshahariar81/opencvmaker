import { z } from "zod";

/**
 * CV creation validation schema.
 *
 * Used when creating a new CV.
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
 *
 * IMPORTANT SECURITY BOUNDARY:
 *
 * The following fields are intentionally NOT allowed here:
 *
 * - status
 * - visibility
 * - isPublic
 *
 * These fields have dedicated endpoints with their own
 * authorization and business rules:
 *
 * - PATCH /cvs/:id/status
 * - PATCH /cvs/:id/public
 *
 * This prevents the generic CV update endpoint from
 * bypassing status-transition and public-visibility rules.
 */
export const updateCVSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, "CV title cannot be empty")
      .max(200, "CV title must not exceed 200 characters")
      .optional(),

    data: z
      .record(z.string(), z.unknown())
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
 * CV template assignment validation schema.
 *
 * Used when assigning an existing template to a CV.
 *
 * Route:
 * PATCH /cvs/:id/template
 */
export const updateCVTemplateSchema = z.object({
  templateId: z
    .string()
    .trim()
    .min(1, "Template ID is required"),
});

export type UpdateCVTemplateInput = z.infer<
  typeof updateCVTemplateSchema
>;

/**
 * CV route parameter validation.
 *
 * Used by all CV routes:
 * /cvs/:id
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
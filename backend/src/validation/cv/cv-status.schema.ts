import { z } from "zod";

/**
 * CV status values supported by the application.
 *
 * DRAFT:
 * CV is still being edited.
 *
 * PUBLISHED:
 * CV is ready and can be published/shared.
 *
 * ARCHIVED:
 * CV is no longer active but should be preserved.
 */
export const cvStatusSchema = z.enum([
  "DRAFT",
  "PUBLISHED",
  "ARCHIVED",
]);

export type CVStatus = z.infer<typeof cvStatusSchema>;

/**
 * CV status update validation schema.
 */
export const updateCVStatusSchema = z.object({
  status: cvStatusSchema,
});

export type UpdateCVStatusInput = z.infer<
  typeof updateCVStatusSchema
>;
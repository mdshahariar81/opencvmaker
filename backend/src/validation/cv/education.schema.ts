import { z } from "zod";

/**
 * Education validation schema.
 *
 * This schema validates education information before it reaches
 * the service/database layer.
 */
export const educationSchema = z.object({
  institution: z
    .string()
    .trim()
    .min(1, "Institution is required")
    .max(200, "Institution must not exceed 200 characters"),

  degree: z
    .string()
    .trim()
    .min(1, "Degree is required")
    .max(200, "Degree must not exceed 200 characters"),

  field: z
    .string()
    .trim()
    .max(200, "Field must not exceed 200 characters")
    .optional(),

  location: z
    .string()
    .trim()
    .max(200, "Location must not exceed 200 characters")
    .optional(),

  /**
   * ISO 8601 datetime string.
   *
   * The service layer converts this into the TimestampString<3>
   * format required by the Prisma 8 ORM contract.
   */
  startDate: z
    .string()
    .datetime()
    .optional(),

  endDate: z
    .string()
    .datetime()
    .optional(),

  current: z
    .boolean()
    .optional(),

  grade: z
    .string()
    .trim()
    .max(100, "Grade must not exceed 100 characters")
    .optional(),

  description: z
    .string()
    .trim()
    .max(5000, "Description must not exceed 5000 characters")
    .optional(),

  url: z
    .string()
    .trim()
    .url("Please provide a valid URL")
    .optional(),

  sortOrder: z
    .number()
    .int()
    .min(0)
    .optional(),
});

export type EducationInput = z.infer<typeof educationSchema>;

/**
 * Route parameter validation for a specific education record.
 *
 * Used by:
 * GET    /cvs/:id/education/:educationId
 * PATCH  /cvs/:id/education/:educationId
 * DELETE /cvs/:id/education/:educationId
 */
export const educationIdParamSchema = z.object({
  educationId: z
    .string()
    .trim()
    .min(1, "Education ID is required"),
});

export type EducationIdParam = z.infer<
  typeof educationIdParamSchema
>;
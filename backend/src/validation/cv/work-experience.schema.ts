import { z } from "zod";

/**
 * Work Experience validation schema.
 *
 * This schema validates employment information before it
 * reaches the service/database layer.
 */
export const workExperienceSchema = z.object({
  company: z
    .string()
    .trim()
    .min(1, "Company is required")
    .max(200, "Company must not exceed 200 characters"),

  position: z
    .string()
    .trim()
    .min(1, "Position is required")
    .max(200, "Position must not exceed 200 characters"),

  location: z
    .string()
    .trim()
    .max(200, "Location must not exceed 200 characters")
    .optional(),

  employmentType: z
    .string()
    .trim()
    .max(100, "Employment type must not exceed 100 characters")
    .optional(),

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

  description: z
    .string()
    .trim()
    .max(5000, "Description must not exceed 5000 characters")
    .optional(),

  /**
   * Achievement bullet points.
   *
   * Example:
   * [
   *   "Developed REST APIs",
   *   "Improved application performance by 30%"
   * ]
   */
  achievements: z
    .array(
      z
        .string()
        .trim()
        .min(1, "Achievement cannot be empty")
        .max(1000, "Achievement must not exceed 1000 characters"),
    )
    .max(30, "Cannot have more than 30 achievements")
    .optional(),

  companyUrl: z
    .string()
    .trim()
    .url("Please provide a valid company URL")
    .optional(),

  sortOrder: z
    .number()
    .int()
    .min(0)
    .optional(),
});

export type WorkExperienceInput = z.infer<
  typeof workExperienceSchema
>;

/**
 * Route parameter validation.
 */
export const workExperienceIdParamSchema = z.object({
  workExperienceId: z
    .string()
    .trim()
    .min(1, "Work experience ID is required"),
});

export type WorkExperienceIdParam = z.infer<
  typeof workExperienceIdParamSchema
>;
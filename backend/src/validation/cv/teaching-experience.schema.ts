import { z } from "zod";

/**
 * Teaching Experience validation.
 *
 * Matches the TeachingExperience Prisma model.
 * Validates teaching, tutoring, and academic instruction
 * experience submitted through the CV API.
 */
export const teachingExperienceSchema = z.object({
  institution: z
    .string()
    .trim()
    .min(1, "Institution name is required")
    .max(300, "Institution name must not exceed 300 characters"),

  role: z
    .string()
    .trim()
    .min(1, "Teaching role is required")
    .max(200, "Teaching role must not exceed 200 characters"),

  subject: z
    .string()
    .trim()
    .max(300, "Subject must not exceed 300 characters")
    .optional(),

  location: z
    .string()
    .trim()
    .max(300, "Location must not exceed 300 characters")
    .optional(),

  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),

  current: z.boolean().optional(),

  description: z
    .string()
    .trim()
    .max(5000, "Description must not exceed 5000 characters")
    .optional(),

  sortOrder: z.number().int().min(0).optional(),
});

export type TeachingExperienceInput = z.infer<
  typeof teachingExperienceSchema
>;

/**
 * Validates the ID of a teaching experience record.
 */
export const teachingExperienceIdParamSchema = z.object({
  teachingExperienceId: z
    .string()
    .trim()
    .min(1, "Teaching experience ID is required"),
});

export type TeachingExperienceIdParam = z.infer<
  typeof teachingExperienceIdParamSchema
>;
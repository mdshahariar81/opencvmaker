import { z } from "zod";

/**
 * Course / Training validation.
 *
 * Matches the Course database model.
 */
export const courseSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Course name is required")
    .max(
      300,
      "Course name must not exceed 300 characters",
    ),

  provider: z
    .string()
    .trim()
    .max(
      300,
      "Course provider must not exceed 300 characters",
    )
    .optional(),

  startDate: z
    .string()
    .datetime()
    .optional(),

  endDate: z
    .string()
    .datetime()
    .optional(),

  credentialId: z
    .string()
    .trim()
    .max(
      200,
      "Credential ID must not exceed 200 characters",
    )
    .optional(),

  credentialUrl: z
    .string()
    .trim()
    .url("Please provide a valid credential URL")
    .optional(),

  description: z
    .string()
    .trim()
    .max(
      5000,
      "Course description must not exceed 5000 characters",
    )
    .optional(),

  sortOrder: z
    .number()
    .int()
    .min(0)
    .optional(),
});

export type CourseInput =
  z.infer<typeof courseSchema>;

export const courseIdParamSchema = z.object({
  courseId: z
    .string()
    .trim()
    .min(1, "Course ID is required"),
});

export type CourseIdParam =
  z.infer<typeof courseIdParamSchema>;

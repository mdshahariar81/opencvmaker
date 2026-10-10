import { z } from "zod";

/**
 * Volunteer Experience validation.
 *
 * Matches the VolunteerExperience database model.
 */
export const volunteerExperienceSchema = z.object({
  organization: z
    .string()
    .trim()
    .min(1, "Organization is required")
    .max(
      200,
      "Organization must not exceed 200 characters",
    ),

  role: z
    .string()
    .trim()
    .min(1, "Volunteer role is required")
    .max(
      200,
      "Volunteer role must not exceed 200 characters",
    ),

  location: z
    .string()
    .trim()
    .max(
      200,
      "Location must not exceed 200 characters",
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

  current: z
    .boolean()
    .optional(),

  description: z
    .string()
    .trim()
    .max(
      5000,
      "Volunteer experience description must not exceed 5000 characters",
    )
    .optional(),

  url: z
    .string()
    .trim()
    .url("Please provide a valid volunteer experience URL")
    .optional(),

  /**
   * Volunteer achievements / impact.
   *
   * Stored in the Prisma Json field as a simple
   * array of achievement strings.
   */
  achievements: z
    .array(
      z
        .string()
        .trim()
        .min(1, "Achievement cannot be empty")
        .max(
          1000,
          "Achievement must not exceed 1000 characters",
        ),
    )
    .optional(),

  sortOrder: z
    .number()
    .int()
    .min(0)
    .optional(),
});

export type VolunteerExperienceInput =
  z.infer<typeof volunteerExperienceSchema>;

export const volunteerExperienceIdParamSchema =
  z.object({
    volunteerExperienceId: z
      .string()
      .trim()
      .min(
        1,
        "Volunteer experience ID is required",
      ),
  });

export type VolunteerExperienceIdParam =
  z.infer<
    typeof volunteerExperienceIdParamSchema
  >;

import { z } from "zod";

/**
 * Leadership Experience validation.
 *
 * Matches the LeadershipExperience Prisma model.
 */
export const leadershipExperienceSchema = z.object({
  organization: z
    .string()
    .trim()
    .min(1, "Organization name is required")
    .max(
      300,
      "Organization name must not exceed 300 characters",
    ),

  role: z
    .string()
    .trim()
    .min(1, "Leadership role is required")
    .max(
      200,
      "Leadership role must not exceed 200 characters",
    ),

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
      "Description must not exceed 5000 characters",
    )
    .optional(),

  /**
   * Key achievements or responsibilities
   * associated with the leadership role.
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

export type LeadershipExperienceInput =
  z.infer<typeof leadershipExperienceSchema>;

/**
 * Validates the ID of a leadership experience record.
 */
export const leadershipExperienceIdParamSchema =
  z.object({
    leadershipExperienceId: z
      .string()
      .trim()
      .min(
        1,
        "Leadership experience ID is required",
      ),
  });

export type LeadershipExperienceIdParam =
  z.infer<
    typeof leadershipExperienceIdParamSchema
  >;
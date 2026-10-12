import { z } from "zod";

/**
 * Extracurricular Activity validation.
 *
 * Matches the ExtracurricularActivity Prisma model.
 * Used to validate activities such as:
 * - Student clubs
 * - Sports
 * - Cultural activities
 * - Community activities
 * - Hobbies and other extracurricular involvement
 */
export const extracurricularActivitySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Activity name is required")
    .max(
      300,
      "Activity name must not exceed 300 characters",
    ),

  role: z
    .string()
    .trim()
    .max(
      200,
      "Role must not exceed 200 characters",
    )
    .optional(),

  organization: z
    .string()
    .trim()
    .max(
      300,
      "Organization name must not exceed 300 characters",
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
      "Description must not exceed 5000 characters",
    )
    .optional(),

  sortOrder: z
    .number()
    .int()
    .min(0)
    .optional(),
});

export type ExtracurricularActivityInput =
  z.infer<typeof extracurricularActivitySchema>;

/**
 * Validates the ID of an extracurricular activity record.
 */
export const extracurricularActivityIdParamSchema =
  z.object({
    extracurricularActivityId: z
      .string()
      .trim()
      .min(
        1,
        "Extracurricular activity ID is required",
      ),
  });

export type ExtracurricularActivityIdParam =
  z.infer<
    typeof extracurricularActivityIdParamSchema
  >;

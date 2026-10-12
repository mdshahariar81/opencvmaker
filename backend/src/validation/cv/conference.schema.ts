import { z } from "zod";

/**
 * Conference validation.
 *
 * Matches the Conference database model.
 */
export const conferenceSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Conference name is required")
    .max(
      300,
      "Conference name must not exceed 300 characters",
    ),

  organizer: z
    .string()
    .trim()
    .max(
      300,
      "Conference organizer must not exceed 300 characters",
    )
    .optional(),

  role: z
    .string()
    .trim()
    .max(
      200,
      "Conference role must not exceed 200 characters",
    )
    .optional(),

  location: z
    .string()
    .trim()
    .max(
      300,
      "Conference location must not exceed 300 characters",
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

  description: z
    .string()
    .trim()
    .max(
      5000,
      "Conference description must not exceed 5000 characters",
    )
    .optional(),

  url: z
    .string()
    .trim()
    .url("Please provide a valid conference URL")
    .optional(),

  sortOrder: z
    .number()
    .int()
    .min(0)
    .optional(),
});

export type ConferenceInput =
  z.infer<typeof conferenceSchema>;

export const conferenceIdParamSchema = z.object({
  conferenceId: z
    .string()
    .trim()
    .min(1, "Conference ID is required"),
});

export type ConferenceIdParam =
  z.infer<typeof conferenceIdParamSchema>;

import { z } from "zod";

/**
 * Personal Information validation.
 *
 * This schema must match the PersonalInformation
 * database model.
 */
export const personalInformationSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(1, "First name is required")
    .max(100, "First name must not exceed 100 characters"),

  lastName: z
    .string()
    .trim()
    .max(100, "Last name must not exceed 100 characters")
    .optional(),

  professionalTitle: z
    .string()
    .trim()
    .max(
      200,
      "Professional title must not exceed 200 characters",
    )
    .optional(),

  email: z
    .string()
    .trim()
    .email("Please provide a valid email address")
    .optional(),

  phone: z
    .string()
    .trim()
    .max(50, "Phone number must not exceed 50 characters")
    .optional(),

  address: z
    .string()
    .trim()
    .max(250, "Address must not exceed 250 characters")
    .optional(),

  city: z
    .string()
    .trim()
    .max(100, "City must not exceed 100 characters")
    .optional(),

  state: z
    .string()
    .trim()
    .max(100, "State must not exceed 100 characters")
    .optional(),

  postalCode: z
    .string()
    .trim()
    .max(30, "Postal code must not exceed 30 characters")
    .optional(),

  country: z
    .string()
    .trim()
    .max(100, "Country must not exceed 100 characters")
    .optional(),

  website: z
    .string()
    .trim()
    .url("Please provide a valid website URL")
    .optional(),

  linkedin: z
    .string()
    .trim()
    .url("Please provide a valid LinkedIn URL")
    .optional(),

  github: z
    .string()
    .trim()
    .url("Please provide a valid GitHub URL")
    .optional(),

  twitter: z
    .string()
    .trim()
    .url("Please provide a valid Twitter URL")
    .optional(),

  instagram: z
    .string()
    .trim()
    .url("Please provide a valid Instagram URL")
    .optional(),

  profileImageUrl: z
    .string()
    .trim()
    .url("Please provide a valid profile image URL")
    .optional(),

  dateOfBirth: z
    .string()
    .trim()
    .max(
      50,
      "Date of birth must not exceed 50 characters",
    )
    .optional(),

  nationality: z
    .string()
    .trim()
    .max(100, "Nationality must not exceed 100 characters")
    .optional(),
});

export type PersonalInformationInput =
  z.infer<typeof personalInformationSchema>;
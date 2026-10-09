import { z } from "zod";

/**
 * Login input validation.
 *
 * Validates and normalizes login credentials
 * before they reach the authentication service.
 */
export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Please provide a valid email address"),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password must not exceed 128 characters"),
});

/**
 * TypeScript type generated from the Zod schema.
 */
export type LoginInput = z.infer<typeof loginSchema>;
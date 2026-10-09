import { z } from "zod";

/**
 * Registration input validation.
 *
 * Validation happens before any database operation.
 * This prevents invalid or unexpected data from
 * reaching the service/database layer.
 */
export const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must not exceed 100 characters"),

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
 * TypeScript type generated directly from the Zod schema.
 */
export type RegisterInput = z.infer<typeof registerSchema>;
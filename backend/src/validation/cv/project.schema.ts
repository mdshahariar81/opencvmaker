import { z } from "zod";

/**
 * Project validation schema.
 *
 * Validates project information before it reaches
 * the service/database layer.
 */
export const projectSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Project name is required")
    .max(200, "Project name must not exceed 200 characters"),

  description: z
    .string()
    .trim()
    .max(5000, "Project description must not exceed 5000 characters")
    .optional(),

  role: z
    .string()
    .trim()
    .max(200, "Project role must not exceed 200 characters")
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

  url: z
    .string()
    .trim()
    .url("Please provide a valid project URL")
    .optional(),

  repository: z
    .string()
    .trim()
    .url("Please provide a valid repository URL")
    .optional(),

  /**
   * Example:
   * ["Next.js", "TypeScript", "PostgreSQL"]
   */
  technologies: z
    .array(
      z
        .string()
        .trim()
        .min(1, "Technology name cannot be empty")
        .max(
          100,
          "Technology name must not exceed 100 characters",
        ),
    )
    .max(
      50,
      "Cannot have more than 50 technologies",
    )
    .optional(),

  sortOrder: z
    .number()
    .int()
    .min(0)
    .optional(),
});

export type ProjectInput = z.infer<typeof projectSchema>;

/**
 * Project route parameter validation.
 */
export const projectIdParamSchema = z.object({
  projectId: z
    .string()
    .trim()
    .min(1, "Project ID is required"),
});

export type ProjectIdParam = z.infer<
  typeof projectIdParamSchema
>;
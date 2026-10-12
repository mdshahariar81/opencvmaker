import { z } from "zod";

/**
 * Membership / Professional Affiliations validation.
 *
 * Validates professional organization memberships listed on a CV.
 * Matches the Membership model in Prisma.
 */
export const membershipSchema = z.object({
  // Professional organization, such as IEEE or ACM.
  organization: z
    .string()
    .trim()
    .min(1, "Organization name is required")
    .max(300, "Organization name must not exceed 300 characters"),

  // Role or position held in the organization.
  role: z
    .string()
    .trim()
    .max(200, "Role must not exceed 200 characters")
    .optional(),

  // Type of professional membership.
  membershipType: z
    .string()
    .trim()
    .max(200, "Membership type must not exceed 200 characters")
    .optional(),

  // Membership number or reference ID supplied by the organization.
  membershipId: z
    .string()
    .trim()
    .max(200, "Membership ID must not exceed 200 characters")
    .optional(),

  // ISO date-time strings received from the API.
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),

  // Whether the membership is currently active.
  current: z.boolean().optional(),

  description: z
    .string()
    .trim()
    .max(5000, "Description must not exceed 5000 characters")
    .optional(),

  url: z
    .string()
    .trim()
    .url("Please provide a valid membership URL")
    .optional(),

  // Controls the position of this section item in the CV.
  sortOrder: z.number().int().min(0).optional(),
});

export type MembershipInput = z.infer<typeof membershipSchema>;

/**
 * Validates the ID of a membership record in the URL.
 */
export const membershipIdParamSchema = z.object({
  membershipId: z
    .string()
    .trim()
    .min(1, "Membership record ID is required"),
});

export type MembershipIdParam = z.infer<
  typeof membershipIdParamSchema
>;
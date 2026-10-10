import { z } from "zod";

/**
 * Certification validation.
 *
 * Matches the Certification database model.
 */
export const certificationSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Certification name is required")
    .max(
      200,
      "Certification name must not exceed 200 characters",
    ),

  issuer: z
    .string()
    .trim()
    .max(
      200,
      "Issuer name must not exceed 200 characters",
    )
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

  issueDate: z
    .string()
    .datetime()
    .optional(),

  expiryDate: z
    .string()
    .datetime()
    .optional(),

  doesNotExpire: z
    .boolean()
    .optional(),

  description: z
    .string()
    .trim()
    .max(
      5000,
      "Certification description must not exceed 5000 characters",
    )
    .optional(),

  sortOrder: z
    .number()
    .int()
    .min(0)
    .optional(),
});

export type CertificationInput =
  z.infer<typeof certificationSchema>;

export const certificationIdParamSchema = z.object({
  certificationId: z
    .string()
    .trim()
    .min(1, "Certification ID is required"),
});

export type CertificationIdParam = z.infer<
  typeof certificationIdParamSchema
>;

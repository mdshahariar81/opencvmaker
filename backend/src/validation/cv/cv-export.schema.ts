import { z } from "zod";

/**
 * Supported CV export formats.
 *
 * These values must match the Prisma ExportFormat enum.
 */
export const exportFormatSchema = z.enum(["PDF", "DOCX", "JPG"]);

export type ExportFormat = z.infer<typeof exportFormatSchema>;

/**
 * Request body for creating a CV export.
 */
export const createCVExportSchema = z.object({
  format: exportFormatSchema,
});

export type CreateCVExportInput = z.infer<
  typeof createCVExportSchema
>;

/**
 * Route parameter validation for a specific CV export.
 */
export const cvExportIdParamSchema = z.object({
  exportId: z
    .string()
    .trim()
    .min(1, "Export ID is required"),
});

export type CVExportIdParam = z.infer<
  typeof cvExportIdParamSchema
>;
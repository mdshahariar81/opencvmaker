import { db } from "../../config/database.js";
import { AppError } from "../../errors/app-error.js";
import type { CreateCVExportInput } from "../../validation/cv/cv-export.schema.js";

/**
 * CV Export Service
 *
 * Handles export records for CV files.
 *
 * The actual PDF/DOCX/JPG generation will be connected later.
 */
export const cvExportService = {
  /**
   * Verify that the CV belongs to the authenticated user.
   */
  async verifyCVOwnership(userId: string, cvId: string) {
    const cv = await db.orm.public.CV
      .where({
        id: cvId,
        userId,
      })
      .first();

    if (!cv) {
      throw new AppError("CV not found", 404);
    }

    return cv;
  },

  /**
   * Create an export record for a CV.
   *
   * The generated file information will be populated later
   * when the actual export generator/storage layer is added.
   */
  async createExport(
    userId: string,
    cvId: string,
    input: CreateCVExportInput,
  ) {
    await this.verifyCVOwnership(userId, cvId);

    return db.orm.public.CVExport.create({
      cvId,
      format: input.format,
      fileUrl: null,
      fileSize: null,
    });
  },

  /**
   * Get all exports belonging to a CV.
   */
  async getExports(userId: string, cvId: string) {
    await this.verifyCVOwnership(userId, cvId);

    return db.orm.public.CVExport
      .where({ cvId })
      .orderBy((exportRecord) => exportRecord.createdAt.desc())
      .all();
  },

  /**
   * Get one export record.
   */
  async getExport(
    userId: string,
    cvId: string,
    exportId: string,
  ) {
    await this.verifyCVOwnership(userId, cvId);

    const exportRecord = await db.orm.public.CVExport
      .where({
        id: exportId,
        cvId,
      })
      .first();

    if (!exportRecord) {
      throw new AppError("CV export not found", 404);
    }

    return exportRecord;
  },

  /**
   * Delete an export record.
   *
   * Actual stored-file deletion will be handled by the
   * storage layer once file generation is implemented.
   */
  async deleteExport(
    userId: string,
    cvId: string,
    exportId: string,
  ) {
    await this.getExport(userId, cvId, exportId);

    await db.orm.public.CVExport
      .where({
        id: exportId,
        cvId,
      })
      .delete();

    return {
      cvId,
      exportId,
    };
  },
};
import { randomUUID } from "node:crypto";
import {
  mkdir,
  readFile,
  unlink,
  writeFile,
} from "node:fs/promises";
import path from "node:path";

import { db } from "../../config/database.js";
import { AppError } from "../../errors/app-error.js";
import type { CreateCVExportInput } from "../../validation/cv/cv-export.schema.js";
import { generateCVDocx } from "./docx-generator.service.js";
import { generateCVJpg } from "./jpg-generator.service.js";
import { generateCVPdf } from "./pdf-generator.service.js";

export const cvExportService = {
  /**
   * Verify that the CV belongs to the authenticated user.
   */
  async verifyCVOwnership(
    userId: string,
    cvId: string,
  ) {
    const cv = await db.orm.public.CV.where({
      id: cvId,
      userId,
    }).first();

    if (!cv) {
      throw new AppError("CV not found", 404);
    }

    return cv;
  },

  /**
   * Create a CV export.
   *
   * Supported formats:
   * - PDF
   * - DOCX
   * - JPG
   */
  async createExport(
    userId: string,
    cvId: string,
    input: CreateCVExportInput,
  ) {
    const cv = await this.verifyCVOwnership(
      userId,
      cvId,
    );

    const [
      personalInformation,
      summary,
      education,
      workExperience,
      skills,
      projects,
      certifications,
      languages,
      awards,
      volunteerExperience,
      publications,
      conferences,
      courses,
      memberships,
      teachingExperience,
      leadershipExperience,
      activities,
      patents,
      interests,
      references,
      customSections,
      sectionSettings,
    ] = await Promise.all([
      db.orm.public.PersonalInformation.where({
        cvId,
      }).first(),

      db.orm.public.ProfessionalSummary.where({
        cvId,
      }).first(),

      db.orm.public.Education.where({ cvId })
        .orderBy((item) => item.sortOrder.asc())
        .all(),

      db.orm.public.WorkExperience.where({ cvId })
        .orderBy((item) => item.sortOrder.asc())
        .all(),

      db.orm.public.Skill.where({ cvId })
        .orderBy((item) => item.sortOrder.asc())
        .all(),

      db.orm.public.Project.where({ cvId })
        .orderBy((item) => item.sortOrder.asc())
        .all(),

      db.orm.public.Certification.where({ cvId })
        .orderBy((item) => item.sortOrder.asc())
        .all(),

      db.orm.public.Language.where({ cvId })
        .orderBy((item) => item.sortOrder.asc())
        .all(),

      db.orm.public.Award.where({ cvId })
        .orderBy((item) => item.sortOrder.asc())
        .all(),

      db.orm.public.VolunteerExperience.where({
        cvId,
      })
        .orderBy((item) => item.sortOrder.asc())
        .all(),

      db.orm.public.Publication.where({ cvId })
        .orderBy((item) => item.sortOrder.asc())
        .all(),

      db.orm.public.Conference.where({ cvId })
        .orderBy((item) => item.sortOrder.asc())
        .all(),

      db.orm.public.Course.where({ cvId })
        .orderBy((item) => item.sortOrder.asc())
        .all(),

      db.orm.public.Membership.where({ cvId })
        .orderBy((item) => item.sortOrder.asc())
        .all(),

      db.orm.public.TeachingExperience.where({
        cvId,
      })
        .orderBy((item) => item.sortOrder.asc())
        .all(),

      db.orm.public.LeadershipExperience.where({
        cvId,
      })
        .orderBy((item) => item.sortOrder.asc())
        .all(),

      db.orm.public.ExtracurricularActivity.where({
        cvId,
      })
        .orderBy((item) => item.sortOrder.asc())
        .all(),

      db.orm.public.Patent.where({ cvId })
        .orderBy((item) => item.sortOrder.asc())
        .all(),

      db.orm.public.Interest.where({ cvId })
        .orderBy((item) => item.sortOrder.asc())
        .all(),

      db.orm.public.Reference.where({ cvId })
        .orderBy((item) => item.sortOrder.asc())
        .all(),

      db.orm.public.CustomSection.where({ cvId })
        .orderBy((item) => item.sortOrder.asc())
        .all(),

      db.orm.public.CVSectionSetting.where({
        cvId,
      })
        .orderBy((item) => item.sortOrder.asc())
        .all(),
    ]);

    /**
     * Build a complete CV snapshot.
     *
     * The same snapshot is used by all
     * export generators.
     */
    const snapshot = {
      cv: {
        title: cv.title,
        slug: cv.slug,
        status: cv.status,
        visibility: cv.visibility,
        isPublic: cv.isPublic,
        templateId: cv.templateId,
        data: cv.data,
      },

      personalInformation,
      summary,
      education,
      workExperience,
      skills,
      projects,
      certifications,
      languages,
      awards,
      volunteerExperience,
      publications,
      conferences,
      courses,
      memberships,
      teachingExperience,
      leadershipExperience,
      activities,
      patents,
      interests,
      references,
      customSections,
      sectionSettings,
    };

    /**
     * Generate the requested export format.
     */
    const generatedBuffer =
      input.format === "PDF"
        ? await generateCVPdf(snapshot)
        : input.format === "DOCX"
          ? await generateCVDocx(snapshot)
          : await generateCVJpg(snapshot);

    const exportDirectory = path.resolve(
      process.cwd(),
      "storage",
      "exports",
    );

    await mkdir(exportDirectory, {
      recursive: true,
    });

    /**
     * Select the correct file extension.
     */
    const extension =
      input.format === "PDF"
        ? "pdf"
        : input.format === "DOCX"
          ? "docx"
          : "jpg";

    /**
     * Generate a unique filename.
     */
    const fileName =
      `${cvId}-${randomUUID()}.${extension}`;

    const filePath = path.join(
      exportDirectory,
      fileName,
    );

    /**
     * Save the generated file to disk.
     */
    await writeFile(
      filePath,
      generatedBuffer,
    );

    /**
     * Store the relative file URL.
     */
    const fileUrl =
      `/exports/${fileName}`;

    try {
      const exportRecord =
        await db.orm.public.CVExport.create({
          cvId,
          format: input.format,
          fileUrl,
          fileSize: generatedBuffer.length,
        });

      return {
        ...exportRecord,
        generatedFileSize:
          generatedBuffer.length,
      };
    } catch (error) {
      /**
       * If database creation fails,
       * remove the generated file.
       */
      try {
        await unlink(filePath);
      } catch {
        // Ignore cleanup failure.
      }

      throw error;
    }
  },

  /**
   * Get all exports for a CV.
   */
  async getExports(
    userId: string,
    cvId: string,
  ) {
    await this.verifyCVOwnership(
      userId,
      cvId,
    );

    return db.orm.public.CVExport
      .where({ cvId })
      .orderBy(
        (exportRecord) =>
          exportRecord.createdAt.desc(),
      )
      .all();
  },

  /**
   * Get one export after verifying ownership.
   */
  async getExport(
    userId: string,
    cvId: string,
    exportId: string,
  ) {
    await this.verifyCVOwnership(
      userId,
      cvId,
    );

    const exportRecord =
      await db.orm.public.CVExport
        .where({
          id: exportId,
          cvId,
        })
        .first();

    if (!exportRecord) {
      throw new AppError(
        "CV export not found",
        404,
      );
    }

    return exportRecord;
  },

  /**
   * Download a generated export file.
   *
   * Ownership is verified before reading
   * the physical file.
   */
  async downloadExport(
    userId: string,
    cvId: string,
    exportId: string,
  ) {
    const exportRecord =
      await this.getExport(
        userId,
        cvId,
        exportId,
      );

    if (!exportRecord.fileUrl) {
      throw new AppError(
        "Export file is not available",
        404,
      );
    }

    /**
     * Only use the filename portion of
     * the stored URL.
     *
     * This prevents filesystem path traversal.
     */
    const fileName = path.basename(
      exportRecord.fileUrl,
    );

    /**
     * PDF, DOCX and JPG downloads are supported.
     */
    const supportedFile =
      (exportRecord.format === "PDF" &&
        fileName.endsWith(".pdf")) ||
      (exportRecord.format === "DOCX" &&
        fileName.endsWith(".docx")) ||
      (exportRecord.format === "JPG" &&
        fileName.endsWith(".jpg"));

    if (!supportedFile) {
      throw new AppError(
        "This export format is not supported for download",
        501,
      );
    }

    const exportDirectory =
      path.resolve(
        process.cwd(),
        "storage",
        "exports",
      );

    const filePath = path.join(
      exportDirectory,
      fileName,
    );

    try {
      const fileBuffer =
        await readFile(filePath);

      return {
        exportRecord,
        fileBuffer,
        fileName,
      };
    } catch {
      throw new AppError(
        "Export file not found",
        404,
      );
    }
  },

  /**
   * Delete one export record and its
   * physical generated file.
   */
  async deleteExport(
    userId: string,
    cvId: string,
    exportId: string,
  ) {
    const exportRecord =
      await this.getExport(
        userId,
        cvId,
        exportId,
      );

    /**
     * Remove the physical file first.
     */
    if (exportRecord.fileUrl) {
      const fileName = path.basename(
        exportRecord.fileUrl,
      );

      const filePath = path.resolve(
        process.cwd(),
        "storage",
        "exports",
        fileName,
      );

      try {
        await unlink(filePath);
      } catch {
        /**
         * The file may already be missing.
         * Database cleanup should still continue.
         */
      }
    }

    /**
     * Remove the database export record.
     */
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
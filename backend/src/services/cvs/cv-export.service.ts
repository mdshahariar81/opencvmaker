import { randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { db } from "../../config/database.js";
import { AppError } from "../../errors/app-error.js";
import type { CreateCVExportInput } from "../../validation/cv/cv-export.schema.js";
import { generateCVPdf } from "./pdf-generator.service.js";

export const cvExportService = {
  /**
   * Verify that the CV belongs to the authenticated user.
   */
  async verifyCVOwnership(userId: string, cvId: string) {
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
   * Currently PDF generation is supported.
   */
  async createExport(
    userId: string,
    cvId: string,
    input: CreateCVExportInput,
  ) {
    const cv = await this.verifyCVOwnership(userId, cvId);

    if (input.format !== "PDF") {
      throw new AppError(
        `${input.format} export generation is not implemented yet`,
        501,
      );
    }

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
      db.orm.public.PersonalInformation.where({ cvId }).first(),

      db.orm.public.ProfessionalSummary.where({ cvId }).first(),

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

      db.orm.public.VolunteerExperience.where({ cvId })
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

      db.orm.public.TeachingExperience.where({ cvId })
        .orderBy((item) => item.sortOrder.asc())
        .all(),

      db.orm.public.LeadershipExperience.where({ cvId })
        .orderBy((item) => item.sortOrder.asc())
        .all(),

      db.orm.public.ExtracurricularActivity.where({ cvId })
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

      db.orm.public.CVSectionSetting.where({ cvId })
        .orderBy((item) => item.sortOrder.asc())
        .all(),
    ]);

    /**
     * Build a complete CV snapshot for PDF generation.
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
     * Generate the actual PDF.
     */
    const pdfBuffer = await generateCVPdf(snapshot);

    /**
     * Create the local export directory.
     */
    const exportDirectory = path.resolve(
      process.cwd(),
      "storage",
      "exports",
    );

    await mkdir(exportDirectory, {
      recursive: true,
    });

    /**
     * Generate a unique PDF filename.
     */
    const fileName = `${cvId}-${randomUUID()}.pdf`;

    const filePath = path.join(
      exportDirectory,
      fileName,
    );

    /**
     * Save the generated PDF to disk.
     */
    await writeFile(filePath, pdfBuffer);

    /**
     * Store the relative file URL in the database.
     */
    const fileUrl = `/exports/${fileName}`;

    const exportRecord = await db.orm.public.CVExport.create({
      cvId,
      format: "PDF",
      fileUrl,
      fileSize: pdfBuffer.length,
    });

    return {
      ...exportRecord,
      generatedFileSize: pdfBuffer.length,
    };
  },

  /**
   * Get all exports for a CV.
   */
  async getExports(userId: string, cvId: string) {
    await this.verifyCVOwnership(userId, cvId);

    return db.orm.public.CVExport
      .where({ cvId })
      .orderBy((exportRecord) => exportRecord.createdAt.desc())
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
   * Download a generated export file.
   *
   * Ownership is verified before reading the physical file.
   */
  async downloadExport(
    userId: string,
    cvId: string,
    exportId: string,
  ) {
    const exportRecord = await this.getExport(
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
     * Extract only the filename from the stored URL.
     *
     * This prevents arbitrary filesystem path traversal.
     */
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
      const fileBuffer = await readFile(filePath);

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
   * Delete one export record.
   */
  async deleteExport(
    userId: string,
    cvId: string,
    exportId: string,
  ) {
    await this.getExport(
      userId,
      cvId,
      exportId,
    );

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
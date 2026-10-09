import { db } from "../../config/database.js";
import { AppError } from "../../errors/app-error.js";
import type { ProfessionalSummaryInput } from "../../validation/cv/professional-summary.schema.js";

/**
 * Professional Summary service.
 *
 * Handles creating, reading, updating and deleting
 * the professional summary of a CV.
 */
export const professionalSummaryService = {
  /**
   * Get the professional summary of a CV.
   */
  async get(userId: string, cvId: string) {
    const cv = await db.orm.public.CV
      .where({
        id: cvId,
        userId,
      })
      .first();

    if (!cv) {
      throw new AppError("CV not found", 404);
    }

    return db.orm.public.ProfessionalSummary
      .where({ cvId })
      .first();
  },

  /**
   * Create or update the professional summary.
   */
  async save(
    userId: string,
    cvId: string,
    input: ProfessionalSummaryInput,
  ) {
    const cv = await db.orm.public.CV
      .where({
        id: cvId,
        userId,
      })
      .first();

    if (!cv) {
      throw new AppError("CV not found", 404);
    }

    const existing =
      await db.orm.public.ProfessionalSummary
        .where({ cvId })
        .first();

    if (existing) {
      return db.orm.public.ProfessionalSummary
        .where({ id: existing.id })
        .update(input);
    }

    return db.orm.public.ProfessionalSummary.create({
      cvId,
      content: input.content,
      isVisible: input.isVisible ?? true,
    });
  },

  /**
   * Delete the professional summary.
   */
  async delete(userId: string, cvId: string) {
    const cv = await db.orm.public.CV
      .where({
        id: cvId,
        userId,
      })
      .first();

    if (!cv) {
      throw new AppError("CV not found", 404);
    }

    const existing =
      await db.orm.public.ProfessionalSummary
        .where({ cvId })
        .first();

    if (!existing) {
      throw new AppError(
        "Professional summary not found",
        404,
      );
    }

    await db.orm.public.ProfessionalSummary
      .where({ id: existing.id })
      .delete();

    return {
      cvId,
    };
  },
};
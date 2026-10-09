import { db } from "../../config/database.js";
import { AppError } from "../../errors/app-error.js";
import type { PersonalInformationInput } from "../../validation/cv/personal-information.schema.js";

/**
 * Personal Information service.
 *
 * Handles creating, reading, updating and deleting
 * the personal information section of a CV.
 */
export const personalInformationService = {
  /**
   * Get personal information for a CV.
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

    return db.orm.public.PersonalInformation
      .where({ cvId })
      .first();
  },

  /**
   * Create or update personal information.
   */
  async save(
    userId: string,
    cvId: string,
    input: PersonalInformationInput,
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
      await db.orm.public.PersonalInformation
        .where({ cvId })
        .first();

    if (existing) {
      return db.orm.public.PersonalInformation
        .where({ id: existing.id })
        .update(input);
    }

    return db.orm.public.PersonalInformation.create({
      cvId,
      ...input,
    });
  },

  /**
   * Delete personal information.
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
      await db.orm.public.PersonalInformation
        .where({ cvId })
        .first();

    if (!existing) {
      throw new AppError(
        "Personal information not found",
        404,
      );
    }

    await db.orm.public.PersonalInformation
      .where({ id: existing.id })
      .delete();

    return {
      cvId,
    };
  },
};
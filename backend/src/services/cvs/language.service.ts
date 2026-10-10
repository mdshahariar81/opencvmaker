import { db } from "../../config/database.js";
import { AppError } from "../../errors/app-error.js";
import type { LanguageInput } from "../../validation/cv/language.schema.js";

/**
 * Language service.
 *
 * Handles creating, reading, updating and deleting
 * languages belonging to a CV.
 */
export const languageService = {
  async getAll(userId: string, cvId: string) {
    const cv = await db.orm.public.CV
      .where({
        id: cvId,
        userId,
      })
      .first();

    if (!cv) {
      throw new AppError("CV not found", 404);
    }

    return db.orm.public.Language
      .where({
        cvId,
      })
      .all();
  },

  async getById(
    userId: string,
    cvId: string,
    languageId: string,
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

    const language =
      await db.orm.public.Language
        .where({
          id: languageId,
          cvId,
        })
        .first();

    if (!language) {
      throw new AppError("Language not found", 404);
    }

    return language;
  },

  async create(
    userId: string,
    cvId: string,
    input: LanguageInput,
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
      await db.orm.public.Language
        .where({
          cvId,
          name: input.name,
        })
        .first();

    if (existing) {
      throw new AppError(
        "This language already exists in the CV",
        409,
      );
    }

    return db.orm.public.Language.create({
      cvId,
      name: input.name,
      level: input.level,
      sortOrder: input.sortOrder ?? 0,
    });
  },

  async update(
    userId: string,
    cvId: string,
    languageId: string,
    input: Partial<LanguageInput>,
  ) {
    const existingLanguage =
      await this.getById(
        userId,
        cvId,
        languageId,
      );

    if (input.name !== undefined) {
      const duplicate =
        await db.orm.public.Language
          .where({
            cvId,
            name: input.name,
          })
          .first();

      if (
        duplicate &&
        duplicate.id !== existingLanguage.id
      ) {
        throw new AppError(
          "This language already exists in the CV",
          409,
        );
      }
    }

    return db.orm.public.Language
      .where({
        id: existingLanguage.id,
      })
      .update({
        name: input.name,
        level: input.level,
        sortOrder: input.sortOrder,
      });
  },

  async delete(
    userId: string,
    cvId: string,
    languageId: string,
  ) {
    const existingLanguage =
      await this.getById(
        userId,
        cvId,
        languageId,
      );

    await db.orm.public.Language
      .where({
        id: existingLanguage.id,
      })
      .delete();

    return {
      cvId,
      languageId,
    };
  },
};

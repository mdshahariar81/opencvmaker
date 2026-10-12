import { db } from "../../config/database.js";
import { AppError } from "../../errors/app-error.js";
import type { CustomSectionInput } from "../../validation/cv/custom-section.schema.js";
type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

export const customSectionService = {
  async getAll(userId: string, cvId: string) {
    const cv = await db.orm.public.CV.where({
      id: cvId,
      userId,
    }).first();

    if (!cv) {
      throw new AppError("CV not found", 404);
    }

    return db.orm.public.CustomSection.where({
      cvId,
    }).all();
  },

  async getById(
    userId: string,
    cvId: string,
    customSectionId: string,
  ) {
    const cv = await db.orm.public.CV.where({
      id: cvId,
      userId,
    }).first();

    if (!cv) {
      throw new AppError("CV not found", 404);
    }

    const customSection = await db.orm.public.CustomSection.where({
      id: customSectionId,
      cvId,
    }).first();

    if (!customSection) {
      throw new AppError("Custom section not found", 404);
    }

    return customSection;
  },

  async create(
    userId: string,
    cvId: string,
    input: CustomSectionInput,
  ) {
    const cv = await db.orm.public.CV.where({
      id: cvId,
      userId,
    }).first();

    if (!cv) {
      throw new AppError("CV not found", 404);
    }

    return db.orm.public.CustomSection.create({
      cvId,
      title: input.title,
      description: input.description,
      content: input.content as JsonValue,
      sortOrder: input.sortOrder ?? 0,
      isVisible: input.isVisible ?? true,
    });
  },

  async update(
    userId: string,
    cvId: string,
    customSectionId: string,
    input: Partial<CustomSectionInput>,
  ) {
    const existingSection = await this.getById(
      userId,
      cvId,
      customSectionId,
    );

    return db.orm.public.CustomSection.where({
      id: existingSection.id,
    }).update({
      title: input.title,
      description: input.description,
      content: input.content as JsonValue,
      sortOrder: input.sortOrder,
      isVisible: input.isVisible,
    });
  },

  async delete(
    userId: string,
    cvId: string,
    customSectionId: string,
  ) {
    const existingSection = await this.getById(
      userId,
      cvId,
      customSectionId,
    );

    await db.orm.public.CustomSection.where({
      id: existingSection.id,
    }).delete();

    return {
      cvId,
      customSectionId,
    };
  },
};

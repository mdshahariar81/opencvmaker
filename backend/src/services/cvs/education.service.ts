import { db } from "../../config/database.js";
import { AppError } from "../../errors/app-error.js";
import type { EducationInput } from "../../validation/cv/education.schema.js";
import type { TimestampString } from "@prisma/orm-postgres/target/codec-types";

/**
 * Prisma 8 expects DateTime fields to use its branded
 * TimestampString<3> type.
 *
 * We validate the incoming date and convert it to the
 * required ISO timestamp format before sending it to the ORM.
 */
function toTimestampString(
  value: string | undefined,
): TimestampString<3> | undefined {
  if (!value) {
    return undefined;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw new AppError("Invalid education date", 400);
  }

  const timestamp = date.toISOString().slice(0, 23);

  return timestamp as TimestampString<3>;
}

/**
 * Education service.
 *
 * Handles all database operations related to education records.
 *
 * Important:
 * - Every operation verifies CV ownership.
 * - Education records belong to a CV.
 * - One CV can have multiple education records.
 */
export const educationService = {
  /**
   * Get all education records for a CV.
   */
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

    return db.orm.public.Education
      .where({
        cvId,
      })
      .all();
  },

  /**
   * Get one education record by ID.
   */
  async getById(
    userId: string,
    cvId: string,
    educationId: string,
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

    const education = await db.orm.public.Education
      .where({
        id: educationId,
        cvId,
      })
      .first();

    if (!education) {
      throw new AppError("Education not found", 404);
    }

    return education;
  },

  /**
   * Create a new education record.
   */
  async create(
    userId: string,
    cvId: string,
    input: EducationInput,
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

    return db.orm.public.Education.create({
      cvId,
      institution: input.institution,
      degree: input.degree,
      field: input.field,
      location: input.location,
      startDate: toTimestampString(input.startDate),
      endDate: toTimestampString(input.endDate),
      current: input.current ?? false,
      grade: input.grade,
      description: input.description,
      url: input.url,
      sortOrder: input.sortOrder ?? 0,
    });
  },

  /**
   * Update an existing education record.
   *
   * Only fields provided by the client are updated.
   */
  async update(
    userId: string,
    cvId: string,
    educationId: string,
    input: Partial<EducationInput>,
  ) {
    const existingEducation = await this.getById(
      userId,
      cvId,
      educationId,
    );

    const updateData = {
      institution: input.institution,
      degree: input.degree,
      field: input.field,
      location: input.location,

      startDate:
        input.startDate === undefined
          ? undefined
          : toTimestampString(input.startDate),

      endDate:
        input.endDate === undefined
          ? undefined
          : toTimestampString(input.endDate),

      current: input.current,
      grade: input.grade,
      description: input.description,
      url: input.url,
      sortOrder: input.sortOrder,
    };

    return db.orm.public.Education
      .where({
        id: existingEducation.id,
      })
      .update(updateData);
  },

  /**
   * Delete an education record.
   */
  async delete(
    userId: string,
    cvId: string,
    educationId: string,
  ) {
    const existingEducation = await this.getById(
      userId,
      cvId,
      educationId,
    );

    await db.orm.public.Education
      .where({
        id: existingEducation.id,
      })
      .delete();

    return {
      cvId,
      educationId,
    };
  },
};
import { db } from "../../config/database.js";
import { AppError } from "../../errors/app-error.js";
import type { WorkExperienceInput } from "../../validation/cv/work-experience.schema.js";
import type { TimestampString } from "@prisma/orm-postgres/target/codec-types";

/**
 * Prisma 8 expects DateTime values to use its branded
 * TimestampString<3> type.
 *
 * This helper validates the incoming date and converts it
 * into the timestamp format expected by the ORM.
 */
function toTimestampString(
  value: string | undefined,
): TimestampString<3> | undefined {
  if (!value) {
    return undefined;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw new AppError("Invalid work experience date", 400);
  }

  const timestamp = date.toISOString().slice(0, 23);

  return timestamp as TimestampString<3>;
}

/**
 * Work Experience service.
 *
 * Handles all database operations related to work experience.
 *
 * Important:
 * - Every operation verifies CV ownership.
 * - One CV can have multiple work experience records.
 * - Achievements are stored as JSON arrays.
 */
export const workExperienceService = {
  /**
   * Get all work experience records for a CV.
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

    return db.orm.public.WorkExperience
      .where({
        cvId,
      })
      .all();
  },

  /**
   * Get one work experience record by ID.
   */
  async getById(
    userId: string,
    cvId: string,
    workExperienceId: string,
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

    const workExperience =
      await db.orm.public.WorkExperience
        .where({
          id: workExperienceId,
          cvId,
        })
        .first();

    if (!workExperience) {
      throw new AppError("Work experience not found", 404);
    }

    return workExperience;
  },

  /**
   * Create a new work experience record.
   */
  async create(
    userId: string,
    cvId: string,
    input: WorkExperienceInput,
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

    return db.orm.public.WorkExperience.create({
      cvId,
      company: input.company,
      position: input.position,
      location: input.location,
      employmentType: input.employmentType,
      startDate: toTimestampString(input.startDate),
      endDate: toTimestampString(input.endDate),
      current: input.current ?? false,
      description: input.description,
      achievements: input.achievements,
      companyUrl: input.companyUrl,
      sortOrder: input.sortOrder ?? 0,
    });
  },

  /**
   * Update an existing work experience record.
   *
   * Only fields provided by the client are updated.
   */
  async update(
    userId: string,
    cvId: string,
    workExperienceId: string,
    input: Partial<WorkExperienceInput>,
  ) {
    const existingWorkExperience =
      await this.getById(
        userId,
        cvId,
        workExperienceId,
      );

    const updateData = {
      company: input.company,
      position: input.position,
      location: input.location,
      employmentType: input.employmentType,

      startDate:
        input.startDate === undefined
          ? undefined
          : toTimestampString(input.startDate),

      endDate:
        input.endDate === undefined
          ? undefined
          : toTimestampString(input.endDate),

      current: input.current,
      description: input.description,
      achievements: input.achievements,
      companyUrl: input.companyUrl,
      sortOrder: input.sortOrder,
    };

    return db.orm.public.WorkExperience
      .where({
        id: existingWorkExperience.id,
      })
      .update(updateData);
  },

  /**
   * Delete a work experience record.
   */
  async delete(
    userId: string,
    cvId: string,
    workExperienceId: string,
  ) {
    const existingWorkExperience =
      await this.getById(
        userId,
        cvId,
        workExperienceId,
      );

    await db.orm.public.WorkExperience
      .where({
        id: existingWorkExperience.id,
      })
      .delete();

    return {
      cvId,
      workExperienceId,
    };
  },
};
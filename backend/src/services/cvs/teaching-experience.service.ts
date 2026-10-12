import { db } from "../../config/database.js";
import { AppError } from "../../errors/app-error.js";
import type { TimestampString } from "@prisma/orm-postgres/target/codec-types";
import type { TeachingExperienceInput } from "../../validation/cv/teaching-experience.schema.js";

/**
 * Converts an ISO date string into the timestamp format
 * expected by the Prisma 8 contract runtime.
 */
function toTimestampString(
  value: string | undefined,
): TimestampString<3> | undefined {
  if (!value) {
    return undefined;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw new AppError("Invalid teaching experience date", 400);
  }

  return date
    .toISOString()
    .slice(0, 23) as TimestampString<3>;
}

/**
 * Teaching Experience service.
 *
 * Manages teaching, tutoring, and academic instruction
 * records belonging to a CV.
 *
 * Every operation verifies that the authenticated user
 * owns the CV before accessing its records.
 */
export const teachingExperienceService = {
  /**
   * Get all teaching experience records for a CV.
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

    return db.orm.public.TeachingExperience
      .where({
        cvId,
      })
      .all();
  },

  /**
   * Get one teaching experience record.
   */
  async getById(
    userId: string,
    cvId: string,
    teachingExperienceId: string,
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

    const experience =
      await db.orm.public.TeachingExperience
        .where({
          id: teachingExperienceId,
          cvId,
        })
        .first();

    if (!experience) {
      throw new AppError(
        "Teaching experience not found",
        404,
      );
    }

    return experience;
  },

  /**
   * Create a teaching experience record.
   */
  async create(
    userId: string,
    cvId: string,
    input: TeachingExperienceInput,
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

    return db.orm.public.TeachingExperience.create({
      cvId,
      institution: input.institution,
      role: input.role,
      subject: input.subject,
      location: input.location,

      startDate: toTimestampString(input.startDate),
      endDate: toTimestampString(input.endDate),

      current: input.current ?? false,
      description: input.description,
      sortOrder: input.sortOrder ?? 0,
    });
  },

  /**
   * Update an existing teaching experience record.
   * Omitted fields remain unchanged.
   */
  async update(
    userId: string,
    cvId: string,
    teachingExperienceId: string,
    input: Partial<TeachingExperienceInput>,
  ) {
    const existingExperience = await this.getById(
      userId,
      cvId,
      teachingExperienceId,
    );

    return db.orm.public.TeachingExperience
      .where({
        id: existingExperience.id,
      })
      .update({
        institution: input.institution,
        role: input.role,
        subject: input.subject,
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
        description: input.description,
        sortOrder: input.sortOrder,
      });
  },

  /**
   * Delete an existing teaching experience record.
   */
  async delete(
    userId: string,
    cvId: string,
    teachingExperienceId: string,
  ) {
    const existingExperience = await this.getById(
      userId,
      cvId,
      teachingExperienceId,
    );

    await db.orm.public.TeachingExperience
      .where({
        id: existingExperience.id,
      })
      .delete();

    return {
      cvId,
      teachingExperienceId,
    };
  },
};
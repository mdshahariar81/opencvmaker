import { db } from "../../config/database.js";
import { AppError } from "../../errors/app-error.js";
import type { TimestampString } from "@prisma/orm-postgres/target/codec-types";
import type { ExtracurricularActivityInput } from "../../validation/cv/extracurricular-activity.schema.js";

/**
 * Convert an ISO date string into the timestamp format
 * expected by the Prisma 8 Postgres runtime.
 */
function toTimestampString(
  value: string | undefined,
): TimestampString<3> | undefined {
  if (!value) return undefined;

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw new AppError(
      "Invalid extracurricular activity date",
      400,
    );
  }

  return date.toISOString().slice(0, 23) as TimestampString<3>;
}

/**
 * Extracurricular Activity service.
 *
 * Handles CRUD operations and makes sure users can only
 * access activities belonging to their own CVs.
 */
export const extracurricularActivityService = {
  /**
   * Get all extracurricular activities for a CV.
   */
  async getAll(userId: string, cvId: string) {
    const cv = await db.orm.public.CV
      .where({ id: cvId, userId })
      .first();

    if (!cv) {
      throw new AppError("CV not found", 404);
    }

    return db.orm.public.ExtracurricularActivity
      .where({ cvId })
      .all();
  },

  /**
   * Get one extracurricular activity by ID.
   */
  async getById(
    userId: string,
    cvId: string,
    extracurricularActivityId: string,
  ) {
    const cv = await db.orm.public.CV
      .where({ id: cvId, userId })
      .first();

    if (!cv) {
      throw new AppError("CV not found", 404);
    }

    const activity =
      await db.orm.public.ExtracurricularActivity
        .where({
          id: extracurricularActivityId,
          cvId,
        })
        .first();

    if (!activity) {
      throw new AppError(
        "Extracurricular activity not found",
        404,
      );
    }

    return activity;
  },

  /**
   * Create a new extracurricular activity.
   */
  async create(
    userId: string,
    cvId: string,
    input: ExtracurricularActivityInput,
  ) {
    const cv = await db.orm.public.CV
      .where({ id: cvId, userId })
      .first();

    if (!cv) {
      throw new AppError("CV not found", 404);
    }

    return db.orm.public.ExtracurricularActivity.create({
      cvId,
      name: input.name,
      role: input.role,
      organization: input.organization,
      startDate: toTimestampString(input.startDate),
      endDate: toTimestampString(input.endDate),
      current: input.current ?? false,
      description: input.description,
      sortOrder: input.sortOrder ?? 0,
    });
  },

  /**
   * Update an existing extracurricular activity.
   */
  async update(
    userId: string,
    cvId: string,
    extracurricularActivityId: string,
    input: Partial<ExtracurricularActivityInput>,
  ) {
    const existingActivity =
      await this.getById(
        userId,
        cvId,
        extracurricularActivityId,
      );

    return db.orm.public.ExtracurricularActivity
      .where({
        id: existingActivity.id,
      })
      .update({
        name: input.name,
        role: input.role,
        organization: input.organization,

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
   * Delete an extracurricular activity.
   */
  async delete(
    userId: string,
    cvId: string,
    extracurricularActivityId: string,
  ) {
    const existingActivity =
      await this.getById(
        userId,
        cvId,
        extracurricularActivityId,
      );

    await db.orm.public.ExtracurricularActivity
      .where({
        id: existingActivity.id,
      })
      .delete();

    return {
      cvId,
      extracurricularActivityId,
    };
  },
};

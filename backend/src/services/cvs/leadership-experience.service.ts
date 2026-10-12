import { db } from "../../config/database.js";
import { AppError } from "../../errors/app-error.js";
import type { TimestampString } from "@prisma/orm-postgres/target/codec-types";
import type { LeadershipExperienceInput } from "../../validation/cv/leadership-experience.schema.js";

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
    throw new AppError(
      "Invalid leadership experience date",
      400,
    );
  }

  return date
    .toISOString()
    .slice(0, 23) as TimestampString<3>;
}

/**
 * Leadership Experience service.
 *
 * Manages leadership, management, and organizational
 * responsibility records belonging to a CV.
 *
 * Every operation verifies that the authenticated user
 * owns the CV before accessing its records.
 */
export const leadershipExperienceService = {
  /**
   * Get all leadership experience records for a CV.
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

    return db.orm.public.LeadershipExperience
      .where({
        cvId,
      })
      .all();
  },

  /**
   * Get one leadership experience record.
   */
  async getById(
    userId: string,
    cvId: string,
    leadershipExperienceId: string,
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
      await db.orm.public.LeadershipExperience
        .where({
          id: leadershipExperienceId,
          cvId,
        })
        .first();

    if (!experience) {
      throw new AppError(
        "Leadership experience not found",
        404,
      );
    }

    return experience;
  },

  /**
   * Create a leadership experience record.
   */
  async create(
    userId: string,
    cvId: string,
    input: LeadershipExperienceInput,
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

    return db.orm.public.LeadershipExperience.create({
      cvId,
      organization: input.organization,
      role: input.role,

      startDate: toTimestampString(input.startDate),
      endDate: toTimestampString(input.endDate),

      current: input.current ?? false,
      description: input.description,
      achievements: input.achievements,
      sortOrder: input.sortOrder ?? 0,
    });
  },

  /**
   * Update an existing leadership experience record.
   * Omitted fields remain unchanged.
   */
  async update(
    userId: string,
    cvId: string,
    leadershipExperienceId: string,
    input: Partial<LeadershipExperienceInput>,
  ) {
    const existingExperience =
      await this.getById(
        userId,
        cvId,
        leadershipExperienceId,
      );

    return db.orm.public.LeadershipExperience
      .where({
        id: existingExperience.id,
      })
      .update({
        organization: input.organization,
        role: input.role,

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
        sortOrder: input.sortOrder,
      });
  },

  /**
   * Delete an existing leadership experience record.
   */
  async delete(
    userId: string,
    cvId: string,
    leadershipExperienceId: string,
  ) {
    const existingExperience =
      await this.getById(
        userId,
        cvId,
        leadershipExperienceId,
      );

    await db.orm.public.LeadershipExperience
      .where({
        id: existingExperience.id,
      })
      .delete();

    return {
      cvId,
      leadershipExperienceId,
    };
  },
};
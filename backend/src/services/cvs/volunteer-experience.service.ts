import { db } from "../../config/database.js";
import { AppError } from "../../errors/app-error.js";
import type { VolunteerExperienceInput } from "../../validation/cv/volunteer-experience.schema.js";
import type { TimestampString } from "@prisma/orm-postgres/target/codec-types";

/**
 * Convert an ISO date string into the timestamp format
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
    throw new AppError("Invalid volunteer experience date", 400);
  }

  return date
    .toISOString()
    .slice(0, 23) as TimestampString<3>;
}

/**
 * Volunteer Experience service.
 *
 * Handles creating, reading, updating and deleting
 * volunteer experiences belonging to a CV.
 */
export const volunteerExperienceService = {
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

    return db.orm.public.VolunteerExperience
      .where({
        cvId,
      })
      .all();
  },

  async getById(
    userId: string,
    cvId: string,
    volunteerExperienceId: string,
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

    const volunteerExperience =
      await db.orm.public.VolunteerExperience
        .where({
          id: volunteerExperienceId,
          cvId,
        })
        .first();

    if (!volunteerExperience) {
      throw new AppError(
        "Volunteer experience not found",
        404,
      );
    }

    return volunteerExperience;
  },

  async create(
    userId: string,
    cvId: string,
    input: VolunteerExperienceInput,
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

    return db.orm.public.VolunteerExperience.create({
      cvId,
      organization: input.organization,
      role: input.role,
      location: input.location,
      startDate: toTimestampString(input.startDate),
      endDate: toTimestampString(input.endDate),
      current: input.current ?? false,
      description: input.description,
      url: input.url,
      achievements: input.achievements,
      sortOrder: input.sortOrder ?? 0,
    });
  },

  async update(
    userId: string,
    cvId: string,
    volunteerExperienceId: string,
    input: Partial<VolunteerExperienceInput>,
  ) {
    const existingExperience =
      await this.getById(
        userId,
        cvId,
        volunteerExperienceId,
      );

    return db.orm.public.VolunteerExperience
      .where({
        id: existingExperience.id,
      })
      .update({
        organization: input.organization,
        role: input.role,
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
        url: input.url,
        achievements: input.achievements,
        sortOrder: input.sortOrder,
      });
  },

  async delete(
    userId: string,
    cvId: string,
    volunteerExperienceId: string,
  ) {
    const existingExperience =
      await this.getById(
        userId,
        cvId,
        volunteerExperienceId,
      );

    await db.orm.public.VolunteerExperience
      .where({
        id: existingExperience.id,
      })
      .delete();

    return {
      cvId,
      volunteerExperienceId,
    };
  },
};

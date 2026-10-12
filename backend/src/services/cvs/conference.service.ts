import { db } from "../../config/database.js";
import { AppError } from "../../errors/app-error.js";
import type { TimestampString } from "@prisma/orm-postgres/target/codec-types";
import type { ConferenceInput } from "../../validation/cv/conference.schema.js";

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
    throw new AppError("Invalid conference date", 400);
  }

  return date
    .toISOString()
    .slice(0, 23) as TimestampString<3>;
}

/**
 * Conference service.
 *
 * Handles creating, reading, updating and deleting
 * conferences belonging to a CV.
 */
export const conferenceService = {
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

    return db.orm.public.Conference
      .where({
        cvId,
      })
      .all();
  },

  async getById(
    userId: string,
    cvId: string,
    conferenceId: string,
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

    const conference =
      await db.orm.public.Conference
        .where({
          id: conferenceId,
          cvId,
        })
        .first();

    if (!conference) {
      throw new AppError(
        "Conference not found",
        404,
      );
    }

    return conference;
  },

  async create(
    userId: string,
    cvId: string,
    input: ConferenceInput,
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

    return db.orm.public.Conference.create({
      cvId,
      name: input.name,
      organizer: input.organizer,
      role: input.role,
      location: input.location,

      startDate: toTimestampString(
        input.startDate,
      ),

      endDate: toTimestampString(
        input.endDate,
      ),

      description: input.description,
      url: input.url,
      sortOrder: input.sortOrder ?? 0,
    });
  },

  async update(
    userId: string,
    cvId: string,
    conferenceId: string,
    input: Partial<ConferenceInput>,
  ) {
    const existingConference =
      await this.getById(
        userId,
        cvId,
        conferenceId,
      );

    return db.orm.public.Conference
      .where({
        id: existingConference.id,
      })
      .update({
        name: input.name,
        organizer: input.organizer,
        role: input.role,
        location: input.location,

        startDate:
          input.startDate === undefined
            ? undefined
            : toTimestampString(
                input.startDate,
              ),

        endDate:
          input.endDate === undefined
            ? undefined
            : toTimestampString(
                input.endDate,
              ),

        description: input.description,
        url: input.url,
        sortOrder: input.sortOrder,
      });
  },

  async delete(
    userId: string,
    cvId: string,
    conferenceId: string,
  ) {
    const existingConference =
      await this.getById(
        userId,
        cvId,
        conferenceId,
      );

    await db.orm.public.Conference
      .where({
        id: existingConference.id,
      })
      .delete();

    return {
      cvId,
      conferenceId,
    };
  },
};

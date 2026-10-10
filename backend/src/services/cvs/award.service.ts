import { db } from "../../config/database.js";
import { AppError } from "../../errors/app-error.js";
import type { AwardInput } from "../../validation/cv/award.schema.js";
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
    throw new AppError("Invalid award date", 400);
  }

  return date
    .toISOString()
    .slice(0, 23) as TimestampString<3>;
}

/**
 * Award service.
 *
 * Handles creating, reading, updating and deleting
 * awards belonging to a CV.
 */
export const awardService = {
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

    return db.orm.public.Award
      .where({
        cvId,
      })
      .all();
  },

  async getById(
    userId: string,
    cvId: string,
    awardId: string,
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

    const award =
      await db.orm.public.Award
        .where({
          id: awardId,
          cvId,
        })
        .first();

    if (!award) {
      throw new AppError("Award not found", 404);
    }

    return award;
  },

  async create(
    userId: string,
    cvId: string,
    input: AwardInput,
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

    return db.orm.public.Award.create({
      cvId,
      title: input.title,
      issuer: input.issuer,
      date: toTimestampString(input.date),
      description: input.description,
      url: input.url,
      sortOrder: input.sortOrder ?? 0,
    });
  },

  async update(
    userId: string,
    cvId: string,
    awardId: string,
    input: Partial<AwardInput>,
  ) {
    const existingAward =
      await this.getById(
        userId,
        cvId,
        awardId,
      );

    return db.orm.public.Award
      .where({
        id: existingAward.id,
      })
      .update({
        title: input.title,
        issuer: input.issuer,

        date:
          input.date === undefined
            ? undefined
            : toTimestampString(input.date),

        description: input.description,
        url: input.url,
        sortOrder: input.sortOrder,
      });
  },

  async delete(
    userId: string,
    cvId: string,
    awardId: string,
  ) {
    const existingAward =
      await this.getById(
        userId,
        cvId,
        awardId,
      );

    await db.orm.public.Award
      .where({
        id: existingAward.id,
      })
      .delete();

    return {
      cvId,
      awardId,
    };
  },
};

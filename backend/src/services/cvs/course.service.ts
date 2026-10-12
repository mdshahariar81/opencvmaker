import { db } from "../../config/database.js";
import { AppError } from "../../errors/app-error.js";
import type { TimestampString } from "@prisma/orm-postgres/target/codec-types";
import type { CourseInput } from "../../validation/cv/course.schema.js";

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
    throw new AppError("Invalid course date", 400);
  }

  return date
    .toISOString()
    .slice(0, 23) as TimestampString<3>;
}

/**
 * Course / Training service.
 *
 * Handles creating, reading, updating and deleting
 * courses belonging to a CV.
 */
export const courseService = {
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

    return db.orm.public.Course
      .where({
        cvId,
      })
      .all();
  },

  async getById(
    userId: string,
    cvId: string,
    courseId: string,
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

    const course =
      await db.orm.public.Course
        .where({
          id: courseId,
          cvId,
        })
        .first();

    if (!course) {
      throw new AppError(
        "Course not found",
        404,
      );
    }

    return course;
  },

  async create(
    userId: string,
    cvId: string,
    input: CourseInput,
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

    return db.orm.public.Course.create({
      cvId,
      name: input.name,
      provider: input.provider,

      startDate: toTimestampString(
        input.startDate,
      ),

      endDate: toTimestampString(
        input.endDate,
      ),

      credentialId: input.credentialId,
      credentialUrl: input.credentialUrl,
      description: input.description,
      sortOrder: input.sortOrder ?? 0,
    });
  },

  async update(
    userId: string,
    cvId: string,
    courseId: string,
    input: Partial<CourseInput>,
  ) {
    const existingCourse =
      await this.getById(
        userId,
        cvId,
        courseId,
      );

    return db.orm.public.Course
      .where({
        id: existingCourse.id,
      })
      .update({
        name: input.name,
        provider: input.provider,

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

        credentialId: input.credentialId,
        credentialUrl: input.credentialUrl,
        description: input.description,
        sortOrder: input.sortOrder,
      });
  },

  async delete(
    userId: string,
    cvId: string,
    courseId: string,
  ) {
    const existingCourse =
      await this.getById(
        userId,
        cvId,
        courseId,
      );

    await db.orm.public.Course
      .where({
        id: existingCourse.id,
      })
      .delete();

    return {
      cvId,
      courseId,
    };
  },
};

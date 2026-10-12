import { db } from "../../config/database.js";
import { AppError } from "../../errors/app-error.js";
import type { TimestampString } from "@prisma/orm-postgres/target/codec-types";
import type { PatentInput } from "../../validation/cv/patent.schema.js";

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
    throw new AppError("Invalid patent date", 400);
  }

  return date.toISOString().slice(0, 23) as TimestampString<3>;
}

/**
 * Patent service.
 *
 * Handles CRUD operations and verifies CV ownership
 * before allowing access to patent records.
 */
export const patentService = {
  /**
   * Get all patents for a CV.
   */
  async getAll(userId: string, cvId: string) {
    const cv = await db.orm.public.CV
      .where({ id: cvId, userId })
      .first();

    if (!cv) {
      throw new AppError("CV not found", 404);
    }

    return db.orm.public.Patent
      .where({ cvId })
      .all();
  },

  /**
   * Get one patent by ID.
   */
  async getById(
    userId: string,
    cvId: string,
    patentId: string,
  ) {
    const cv = await db.orm.public.CV
      .where({ id: cvId, userId })
      .first();

    if (!cv) {
      throw new AppError("CV not found", 404);
    }

    const patent = await db.orm.public.Patent
      .where({
        id: patentId,
        cvId,
      })
      .first();

    if (!patent) {
      throw new AppError("Patent not found", 404);
    }

    return patent;
  },

  /**
   * Create a new patent.
   */
  async create(
    userId: string,
    cvId: string,
    input: PatentInput,
  ) {
    const cv = await db.orm.public.CV
      .where({ id: cvId, userId })
      .first();

    if (!cv) {
      throw new AppError("CV not found", 404);
    }

    return db.orm.public.Patent.create({
      cvId,
      title: input.title,
      patentNumber: input.patentNumber,
      inventors: input.inventors,
      issuer: input.issuer,
      filingDate: toTimestampString(input.filingDate),
      issueDate: toTimestampString(input.issueDate),
      status: input.status,
      url: input.url,
      description: input.description,
      sortOrder: input.sortOrder ?? 0,
    });
  },

  /**
   * Update an existing patent.
   */
  async update(
    userId: string,
    cvId: string,
    patentId: string,
    input: Partial<PatentInput>,
  ) {
    const existingPatent = await this.getById(
      userId,
      cvId,
      patentId,
    );

    return db.orm.public.Patent
      .where({
        id: existingPatent.id,
      })
      .update({
        title: input.title,
        patentNumber: input.patentNumber,
        inventors: input.inventors,
        issuer: input.issuer,

        filingDate:
          input.filingDate === undefined
            ? undefined
            : toTimestampString(input.filingDate),

        issueDate:
          input.issueDate === undefined
            ? undefined
            : toTimestampString(input.issueDate),

        status: input.status,
        url: input.url,
        description: input.description,
        sortOrder: input.sortOrder,
      });
  },

  /**
   * Delete a patent.
   */
  async delete(
    userId: string,
    cvId: string,
    patentId: string,
  ) {
    const existingPatent = await this.getById(
      userId,
      cvId,
      patentId,
    );

    await db.orm.public.Patent
      .where({
        id: existingPatent.id,
      })
      .delete();

    return {
      cvId,
      patentId,
    };
  },
};

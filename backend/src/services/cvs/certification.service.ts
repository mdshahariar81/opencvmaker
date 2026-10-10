import { db } from "../../config/database.js";
import { AppError } from "../../errors/app-error.js";
import type { CertificationInput } from "../../validation/cv/certification.schema.js";
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
    throw new AppError("Invalid certification date", 400);
  }

  return date.toISOString().slice(0, 23) as TimestampString<3>;
}

/**
 * Certification service.
 *
 * Handles creating, reading, updating and deleting
 * certifications belonging to a CV.
 */
export const certificationService = {
  /**
   * Get all certifications for a CV.
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

    return db.orm.public.Certification
      .where({
        cvId,
      })
      .all();
  },

  /**
   * Get one certification by ID.
   */
  async getById(
    userId: string,
    cvId: string,
    certificationId: string,
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

    const certification =
      await db.orm.public.Certification
        .where({
          id: certificationId,
          cvId,
        })
        .first();

    if (!certification) {
      throw new AppError(
        "Certification not found",
        404,
      );
    }

    return certification;
  },

  /**
   * Create a new certification.
   */
  async create(
    userId: string,
    cvId: string,
    input: CertificationInput,
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

    return db.orm.public.Certification.create({
      cvId,
      name: input.name,
      issuer: input.issuer,
      credentialId: input.credentialId,
      credentialUrl: input.credentialUrl,
      issueDate: toTimestampString(input.issueDate),
      expiryDate: toTimestampString(input.expiryDate),
      doesNotExpire: input.doesNotExpire ?? false,
      description: input.description,
      sortOrder: input.sortOrder ?? 0,
    });
  },

  /**
   * Update an existing certification.
   */
  async update(
    userId: string,
    cvId: string,
    certificationId: string,
    input: Partial<CertificationInput>,
  ) {
    const existingCertification =
      await this.getById(
        userId,
        cvId,
        certificationId,
      );

    const updateData = {
      name: input.name,
      issuer: input.issuer,
      credentialId: input.credentialId,
      credentialUrl: input.credentialUrl,

      issueDate:
        input.issueDate === undefined
          ? undefined
          : toTimestampString(input.issueDate),

      expiryDate:
        input.expiryDate === undefined
          ? undefined
          : toTimestampString(input.expiryDate),

      doesNotExpire: input.doesNotExpire,
      description: input.description,
      sortOrder: input.sortOrder,
    };

    return db.orm.public.Certification
      .where({
        id: existingCertification.id,
      })
      .update(updateData);
  },

  /**
   * Delete an existing certification.
   */
  async delete(
    userId: string,
    cvId: string,
    certificationId: string,
  ) {
    const existingCertification =
      await this.getById(
        userId,
        cvId,
        certificationId,
      );

    await db.orm.public.Certification
      .where({
        id: existingCertification.id,
      })
      .delete();

    return {
      cvId,
      certificationId,
    };
  },
};

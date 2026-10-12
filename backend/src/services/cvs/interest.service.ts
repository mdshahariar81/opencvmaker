import { db } from "../../config/database.js";
import { AppError } from "../../errors/app-error.js";
import type { InterestInput } from "../../validation/cv/interest.schema.js";

/**
 * Interest service.
 *
 * Handles CRUD operations for CV interests.
 * Every operation verifies that the CV belongs to the authenticated user.
 */
export const interestService = {
  async getAll(userId: string, cvId: string) {
    const cv = await db.orm.public.CV.where({ id: cvId, userId }).first();

    if (!cv) {
      throw new AppError("CV not found", 404);
    }

    return db.orm.public.Interest.where({ cvId }).all();
  },

  async getById(userId: string, cvId: string, interestId: string) {
    const cv = await db.orm.public.CV.where({ id: cvId, userId }).first();

    if (!cv) {
      throw new AppError("CV not found", 404);
    }

    const interest = await db.orm.public.Interest
      .where({ id: interestId, cvId })
      .first();

    if (!interest) {
      throw new AppError("Interest not found", 404);
    }

    return interest;
  },

  async create(
    userId: string,
    cvId: string,
    input: InterestInput,
  ) {
    const cv = await db.orm.public.CV.where({ id: cvId, userId }).first();

    if (!cv) {
      throw new AppError("CV not found", 404);
    }

    // The database has a unique constraint on (cvId, name).
    // This prevents duplicate interest names for the same CV.
    const existingInterest = await db.orm.public.Interest
      .where({
        cvId,
        name: input.name,
      })
      .first();

    if (existingInterest) {
      throw new AppError("This interest already exists", 409);
    }

    return db.orm.public.Interest.create({
      cvId,
      name: input.name,
      description: input.description,
      sortOrder: input.sortOrder ?? 0,
    });
  },

  async update(
    userId: string,
    cvId: string,
    interestId: string,
    input: Partial<InterestInput>,
  ) {
    const existingInterest = await this.getById(
      userId,
      cvId,
      interestId,
    );

    // If the name is being changed, check for duplicates first.
    if (input.name !== undefined && input.name !== existingInterest.name) {
      const duplicateInterest = await db.orm.public.Interest
        .where({
          cvId,
          name: input.name,
        })
        .first();

      if (duplicateInterest) {
        throw new AppError("This interest already exists", 409);
      }
    }

    return db.orm.public.Interest
      .where({ id: existingInterest.id })
      .update({
        name: input.name,
        description: input.description,
        sortOrder: input.sortOrder,
      });
  },

  async delete(
    userId: string,
    cvId: string,
    interestId: string,
  ) {
    const existingInterest = await this.getById(
      userId,
      cvId,
      interestId,
    );

    await db.orm.public.Interest
      .where({ id: existingInterest.id })
      .delete();

    return {
      cvId,
      interestId,
    };
  },
};

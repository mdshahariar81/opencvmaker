import { db } from "../../config/database.js";
import { AppError } from "../../errors/app-error.js";
import type { ReferenceInput } from "../../validation/cv/reference.schema.js";

export const referenceService = {
  async getAll(userId: string, cvId: string) {
    const cv = await db.orm.public.CV.where({
      id: cvId,
      userId,
    }).first();

    if (!cv) {
      throw new AppError("CV not found", 404);
    }

    return db.orm.public.Reference.where({
      cvId,
    }).all();
  },

  async getById(
    userId: string,
    cvId: string,
    referenceId: string,
  ) {
    const cv = await db.orm.public.CV.where({
      id: cvId,
      userId,
    }).first();

    if (!cv) {
      throw new AppError("CV not found", 404);
    }

    const reference = await db.orm.public.Reference.where({
      id: referenceId,
      cvId,
    }).first();

    if (!reference) {
      throw new AppError("Reference not found", 404);
    }

    return reference;
  },

  async create(
    userId: string,
    cvId: string,
    input: ReferenceInput,
  ) {
    const cv = await db.orm.public.CV.where({
      id: cvId,
      userId,
    }).first();

    if (!cv) {
      throw new AppError("CV not found", 404);
    }

    return db.orm.public.Reference.create({
      cvId,
      name: input.name,
      position: input.position,
      company: input.company,
      type: input.type ?? "PROFESSIONAL",
      email: input.email,
      phone: input.phone,
      relationship: input.relationship,
      website: input.website,
      description: input.description,
      sortOrder: input.sortOrder ?? 0,
    });
  },

  async update(
    userId: string,
    cvId: string,
    referenceId: string,
    input: Partial<ReferenceInput>,
  ) {
    const existingReference = await this.getById(
      userId,
      cvId,
      referenceId,
    );

    return db.orm.public.Reference.where({
      id: existingReference.id,
    }).update({
      name: input.name,
      position: input.position,
      company: input.company,
      type: input.type,
      email: input.email,
      phone: input.phone,
      relationship: input.relationship,
      website: input.website,
      description: input.description,
      sortOrder: input.sortOrder,
    });
  },

  async delete(
    userId: string,
    cvId: string,
    referenceId: string,
  ) {
    const existingReference = await this.getById(
      userId,
      cvId,
      referenceId,
    );

    await db.orm.public.Reference.where({
      id: existingReference.id,
    }).delete();

    return {
      cvId,
      referenceId,
    };
  },
};

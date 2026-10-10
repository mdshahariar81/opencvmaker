import { db } from "../../config/database.js";
import { AppError } from "../../errors/app-error.js";
import type { TimestampString } from "@prisma/orm-postgres/target/codec-types";
import type { PublicationInput } from "../../validation/cv/publication.schema.js";

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
    throw new AppError("Invalid publication date", 400);
  }

  return date
    .toISOString()
    .slice(0, 23) as TimestampString<3>;
}

/**
 * Publication service.
 *
 * Handles creating, reading, updating and deleting
 * publications belonging to a CV.
 */
export const publicationService = {
  /**
   * Get all publications belonging to a CV.
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

    return db.orm.public.Publication
      .where({
        cvId,
      })
      .all();
  },

  /**
   * Get a single publication by ID.
   */
  async getById(
    userId: string,
    cvId: string,
    publicationId: string,
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

    const publication =
      await db.orm.public.Publication
        .where({
          id: publicationId,
          cvId,
        })
        .first();

    if (!publication) {
      throw new AppError(
        "Publication not found",
        404,
      );
    }

    return publication;
  },

  /**
   * Create a new publication.
   */
  async create(
    userId: string,
    cvId: string,
    input: PublicationInput,
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

    return db.orm.public.Publication.create({
      cvId,
      title: input.title,
      authors: input.authors,
      publisher: input.publisher,
      publicationDate: toTimestampString(
        input.publicationDate,
      ),
      journal: input.journal,
      volume: input.volume,
      issue: input.issue,
      pages: input.pages,
      doi: input.doi,
      url: input.url,
      description: input.description,
      sortOrder: input.sortOrder ?? 0,
    });
  },

  /**
   * Update an existing publication.
   */
  async update(
    userId: string,
    cvId: string,
    publicationId: string,
    input: Partial<PublicationInput>,
  ) {
    const existingPublication =
      await this.getById(
        userId,
        cvId,
        publicationId,
      );

    return db.orm.public.Publication
      .where({
        id: existingPublication.id,
      })
      .update({
        title: input.title,
        authors: input.authors,
        publisher: input.publisher,

        publicationDate:
          input.publicationDate === undefined
            ? undefined
            : toTimestampString(
                input.publicationDate,
              ),

        journal: input.journal,
        volume: input.volume,
        issue: input.issue,
        pages: input.pages,
        doi: input.doi,
        url: input.url,
        description: input.description,
        sortOrder: input.sortOrder,
      });
  },

  /**
   * Delete an existing publication.
   */
  async delete(
    userId: string,
    cvId: string,
    publicationId: string,
  ) {
    const existingPublication =
      await this.getById(
        userId,
        cvId,
        publicationId,
      );

    await db.orm.public.Publication
      .where({
        id: existingPublication.id,
      })
      .delete();

    return {
      cvId,
      publicationId,
    };
  },
};

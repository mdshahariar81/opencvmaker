import { db } from "../../config/database.js";
import { AppError } from "../../errors/app-error.js";

/**
 * JSON-compatible value.
 *
 * Prisma Json fields only accept valid JSON values.
 */
type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | {
      [key: string]: JsonValue;
    };

/**
 * CV service.
 *
 * Keeps CV database and business logic separate
 * from HTTP route handlers.
 */
export const cvService = {
  /**
   * Create a new CV for a user.
   */
  async createCV(
    userId: string,
    input: {
      title: string;
      templateId?: string;
      data?: unknown;
    },
  ) {
    // Verify the selected template when one is provided.
    if (input.templateId) {
      const template = await db.orm.public.Template
        .where({ id: input.templateId })
        .first();

      if (!template || !template.isActive) {
        throw new AppError("Template not found or inactive", 404);
      }
    }

    // Convert incoming CV data into the JSON type
    // expected by the Prisma 8 ORM contract.
    const cvData: JsonValue = input.data
      ? (input.data as JsonValue)
      : {};

    // Create the CV owned by the authenticated user.
    return db.orm.public.CV.create({
      userId,
      title: input.title,
      templateId: input.templateId,
      data: cvData,
    });
  },

  /**
   * Get all CVs owned by a user.
   */
  async getUserCVs(userId: string) {
    return db.orm.public.CV
      .where({ userId })
      .all();
  },

  /**
   * Get a single CV owned by a user.
   *
   * Ownership is enforced directly in the query.
   */
  async getCVById(userId: string, cvId: string) {
    const cv = await db.orm.public.CV
      .where({
        id: cvId,
        userId,
      })
      .first();

    if (!cv) {
      throw new AppError("CV not found", 404);
    }

    return cv;
  },

  /**
   * Update a CV owned by a user.
   */
  async updateCV(
    userId: string,
    cvId: string,
    input: {
      title?: string;
      templateId?: string | null;
      data?: unknown;
      status?: "DRAFT" | "PUBLISHED" | "ARCHIVED";
      visibility?: "PUBLIC" | "PRIVATE";
      isPublic?: boolean;
    },
  ) {
    // First verify ownership.
    const existingCV = await db.orm.public.CV
      .where({
        id: cvId,
        userId,
      })
      .first();

    if (!existingCV) {
      throw new AppError("CV not found", 404);
    }

    // Verify the new template when one is provided.
    if (input.templateId) {
      const template = await db.orm.public.Template
        .where({ id: input.templateId })
        .first();

      if (!template || !template.isActive) {
        throw new AppError("Template not found or inactive", 404);
      }
    }

    /**
     * Build update data.
     *
     * Only include JSON data when the client
     * actually sends it.
     */
    const updateData = {
      title: input.title,
      templateId: input.templateId,
      data:
        input.data === undefined
          ? undefined
          : (input.data as JsonValue),
      status: input.status,
      visibility: input.visibility,
      isPublic: input.isPublic,
      version: existingCV.version + 1,
    };

    // Update only the already verified CV.
    return db.orm.public.CV
      .where({ id: cvId })
      .update(updateData);
  },

  /**
   * Delete a CV owned by a user.
   */
  async deleteCV(userId: string, cvId: string) {
    // Verify ownership first.
    const existingCV = await db.orm.public.CV
      .where({
        id: cvId,
        userId,
      })
      .first();

    if (!existingCV) {
      throw new AppError("CV not found", 404);
    }

    // Delete only the verified CV.
    await db.orm.public.CV
      .where({ id: cvId })
      .delete();

    return {
      id: cvId,
    };
  },
};
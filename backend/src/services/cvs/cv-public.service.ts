import { db } from "../../config/database.js";
import { AppError } from "../../errors/app-error.js";

export const cvPublicService = {
  /**
   * Verify that the CV belongs to the authenticated user.
   */
  async verifyCVOwnership(userId: string, cvId: string) {
    const cv = await db.orm.public.CV
      .where({ id: cvId, userId })
      .first();

    if (!cv) {
      throw new AppError("CV not found", 404);
    }

    return cv;
  },

  /**
   * Make a CV public or private.
   *
   * Public CV requirements:
   * - CV must be PUBLISHED
   * - A unique slug is required
   */
  async updatePublicSettings(
    userId: string,
    cvId: string,
    isPublic: boolean,
    slug?: string,
  ) {
    const cv = await this.verifyCVOwnership(userId, cvId);

    if (!isPublic) {
      return db.orm.public.CV
        .where({ id: cvId })
        .update({
          isPublic: false,
          visibility: "PRIVATE",
        });
    }

    if (cv.status !== "PUBLISHED") {
      throw new AppError(
        "Only published CVs can be made public",
        400,
      );
    }

    if (!slug) {
      throw new AppError(
        "A public CV slug is required",
        400,
      );
    }

    const existingCV = await db.orm.public.CV
      .where({ slug })
      .first();

    if (existingCV && existingCV.id !== cvId) {
      throw new AppError(
        "This public CV slug is already in use",
        409,
      );
    }

    return db.orm.public.CV
      .where({ id: cvId })
      .update({
        isPublic: true,
        visibility: "PUBLIC",
        slug,
      });
  },

  /**
   * Get a public CV by its slug.
   *
   * This method does NOT require authentication.
   *
   * Important:
   * Never return internal database metadata through
   * the public endpoint.
   */
  async getPublicCV(slug: string) {
    const cv = await db.orm.public.CV
      .where({
        slug,
        isPublic: true,
        visibility: "PUBLIC",
        status: "PUBLISHED",
      })
      .first();

    if (!cv) {
      throw new AppError("Public CV not found", 404);
    }

    /**
     * Return only information that belongs to the
     * public CV representation.
     *
     * Internal fields such as userId, database ID,
     * timestamps, version and visibility are intentionally
     * excluded.
     */
    return {
      title: cv.title,
      slug: cv.slug,
      data: cv.data,
    };
  },
};
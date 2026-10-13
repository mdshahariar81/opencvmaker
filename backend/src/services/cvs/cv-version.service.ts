import { db } from "../../config/database.js";
import { AppError } from "../../errors/app-error.js";

/**
 * CV Version Service
 *
 * Handles version history for CVs.
 *
 * Responsibilities:
 * - Verify CV ownership
 * - Create a complete CV snapshot
 * - List CV versions
 * - Read a specific CV version
 * - Restore an older CV version as the current CV
 */
export const cvVersionService = {
  /**
   * Verify that the CV belongs to the authenticated user.
   */
  async verifyCVOwnership(userId: string, cvId: string) {
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
   * Create a new CV version snapshot.
   *
   * The snapshot stores the complete current CV data.
   * Version numbers are generated sequentially per CV.
   */
  async createVersion(userId: string, cvId: string) {
    const cv = await this.verifyCVOwnership(userId, cvId);

    const latestVersion = await db.orm.public.CVVersion
      .where({
        cvId,
      })
      .orderBy((version) => version.version.desc())
      .first();

    const nextVersion = latestVersion
      ? latestVersion.version + 1
      : 1;

    const version = await db.orm.public.CVVersion.create({
      cvId,
      version: nextVersion,
      data: cv.data,
    });

    return version;
  },

  /**
   * Get all saved versions for a CV.
   */
  async getVersions(userId: string, cvId: string) {
    await this.verifyCVOwnership(userId, cvId);

    return db.orm.public.CVVersion
      .where({
        cvId,
      })
      .orderBy((version) => version.version.desc())
      .all();
  },

  /**
   * Get one specific CV version.
   */
  async getVersion(
    userId: string,
    cvId: string,
    versionNumber: number,
  ) {
    await this.verifyCVOwnership(userId, cvId);

    const version = await db.orm.public.CVVersion
      .where({
        cvId,
        version: versionNumber,
      })
      .first();

    if (!version) {
      throw new AppError("CV version not found", 404);
    }

    return version;
  },

  /**
   * Restore a previous CV version.
   *
   * The selected version remains unchanged.
   * Restoring creates a new version containing
   * the restored data.
   */
  async restoreVersion(
    userId: string,
    cvId: string,
    versionNumber: number,
  ) {
    const cv = await this.verifyCVOwnership(userId, cvId);

    const version = await db.orm.public.CVVersion
      .where({
        cvId,
        version: versionNumber,
      })
      .first();

    if (!version) {
      throw new AppError("CV version not found", 404);
    }

    // Replace the current CV data with the selected snapshot.
    const updatedCV = await db.orm.public.CV
      .where({
        id: cv.id,
      })
      .update({
        data: version.data,
      });

    // Save the restored state as a new version.
    const latestVersion = await db.orm.public.CVVersion
      .where({
        cvId,
      })
      .orderBy((item) => item.version.desc())
      .first();

    const nextVersion = latestVersion
      ? latestVersion.version + 1
      : 1;

    const restoredVersion =
      await db.orm.public.CVVersion.create({
        cvId,
        version: nextVersion,
        data: version.data,
      });

    return {
      cv: updatedCV,
      restoredFromVersion: versionNumber,
      newVersion: restoredVersion,
    };
  },
};
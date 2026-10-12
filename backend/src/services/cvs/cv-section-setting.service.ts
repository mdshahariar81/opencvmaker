import { db } from "../../config/database.js";
import { AppError } from "../../errors/app-error.js";

export const cvSectionSettingService = {
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
   * Get all section settings for a CV.
   */
  async getSectionSettings(userId: string, cvId: string) {
    await this.verifyCVOwnership(userId, cvId);

    return db.orm.public.CVSectionSetting
      .where({ cvId })
      .all();
  },

  /**
   * Create a section setting.
   */
  async createSectionSetting(
    userId: string,
    cvId: string,
    input: {
      sectionKey: string;
      isVisible?: boolean;
      sortOrder?: number;
    },
  ) {
    await this.verifyCVOwnership(userId, cvId);

    const existing = await db.orm.public.CVSectionSetting
      .where({
        cvId,
        sectionKey: input.sectionKey,
      })
      .first();

    if (existing) {
      throw new AppError(
        "Section setting already exists",
        409,
      );
    }

    return db.orm.public.CVSectionSetting.create({
      cvId,
      sectionKey: input.sectionKey,
      isVisible: input.isVisible ?? true,
      sortOrder: input.sortOrder ?? 0,
    });
  },

  /**
   * Update a section setting.
   */
  async updateSectionSetting(
    userId: string,
    cvId: string,
    settingId: string,
    input: {
      sectionKey?: string;
      isVisible?: boolean;
      sortOrder?: number;
    },
  ) {
    await this.verifyCVOwnership(userId, cvId);

    const setting = await db.orm.public.CVSectionSetting
      .where({
        id: settingId,
        cvId,
      })
      .first();

    if (!setting) {
      throw new AppError("Section setting not found", 404);
    }

    if (input.sectionKey && input.sectionKey !== setting.sectionKey) {
      const existing = await db.orm.public.CVSectionSetting
        .where({
          cvId,
          sectionKey: input.sectionKey,
        })
        .first();

      if (existing) {
        throw new AppError(
          "Section setting already exists",
          409,
        );
      }
    }

    return db.orm.public.CVSectionSetting
      .where({
        id: settingId,
      })
      .update({
        sectionKey: input.sectionKey,
        isVisible: input.isVisible,
        sortOrder: input.sortOrder,
      });
  },

  /**
   * Delete a section setting.
   */
  async deleteSectionSetting(
    userId: string,
    cvId: string,
    settingId: string,
  ) {
    await this.verifyCVOwnership(userId, cvId);

    const setting = await db.orm.public.CVSectionSetting
      .where({
        id: settingId,
        cvId,
      })
      .first();

    if (!setting) {
      throw new AppError("Section setting not found", 404);
    }

    await db.orm.public.CVSectionSetting
      .where({
        id: settingId,
      })
      .delete();

    return {
      id: settingId,
    };
  },
};

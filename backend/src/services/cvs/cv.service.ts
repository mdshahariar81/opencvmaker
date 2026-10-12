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
    if (input.templateId) {
      const template = await db.orm.public.Template
        .where({ id: input.templateId })
        .first();

      if (!template || !template.isActive) {
        throw new AppError("Template not found or inactive", 404);
      }
    }

    const cvData: JsonValue = input.data
      ? (input.data as JsonValue)
      : {};

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
   * Get the complete CV with all related sections.
   */
  async getFullCV(userId: string, cvId: string) {
    // Verify that the CV belongs to the authenticated user.
    const cv = await db.orm.public.CV
      .where({
        id: cvId,
        userId,
      })
      .first();

    if (!cv) {
      throw new AppError("CV not found", 404);
    }

    // Load all CV sections in parallel.
    const [
      personalInformation,
      summary,
      education,
      workExperience,
      skills,
      projects,
      certifications,
      languages,
      awards,
      volunteerExperience,
      publications,
      conferences,
      courses,
      memberships,
      teachingExperience,
      leadershipExperience,
      activities,
      patents,
      interests,
      references,
      customSections,
      sectionSettings,
    ] = await Promise.all([
      db.orm.public.PersonalInformation.where({ cvId }).first(),
      db.orm.public.ProfessionalSummary.where({ cvId }).first(),
      db.orm.public.Education.where({ cvId }).all(),
      db.orm.public.WorkExperience.where({ cvId }).all(),
      db.orm.public.Skill.where({ cvId }).all(),
      db.orm.public.Project.where({ cvId }).all(),
      db.orm.public.Certification.where({ cvId }).all(),
      db.orm.public.Language.where({ cvId }).all(),
      db.orm.public.Award.where({ cvId }).all(),
      db.orm.public.VolunteerExperience.where({ cvId }).all(),
      db.orm.public.Publication.where({ cvId }).all(),
      db.orm.public.Conference.where({ cvId }).all(),
      db.orm.public.Course.where({ cvId }).all(),
      db.orm.public.Membership.where({ cvId }).all(),
      db.orm.public.TeachingExperience.where({ cvId }).all(),
      db.orm.public.LeadershipExperience.where({ cvId }).all(),
      db.orm.public.ExtracurricularActivity.where({ cvId }).all(),
      db.orm.public.Patent.where({ cvId }).all(),
      db.orm.public.Interest.where({ cvId }).all(),
      db.orm.public.Reference.where({ cvId }).all(),
      db.orm.public.CustomSection.where({ cvId }).all(),
      db.orm.public.CVSectionSetting.where({ cvId }).all(),
    ]);

    // Return the CV together with all of its sections.
    return {
      ...cv,
      personalInformation,
      summary,
      education,
      workExperience,
      skills,
      projects,
      certifications,
      languages,
      awards,
      volunteerExperience,
      publications,
      conferences,
      courses,
      memberships,
      teachingExperience,
      leadershipExperience,
      activities,
      patents,
      interests,
      references,
      customSections,
      sectionSettings,
    };
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

    await db.orm.public.CV
      .where({ id: cvId })
      .delete();

    return {
      id: cvId,
    };
  },
};

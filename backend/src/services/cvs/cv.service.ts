import { db } from "../../config/database.js";

import { AppError } from "../../errors/app-error.js";

/**
 * CV Service
 *
 * Handles:
 * - CV creation
 * - CV listing
 * - CV retrieval
 * - Full CV retrieval
 * - CV template assignment
 * - CV duplication
 * - CV status management
 * - CV update
 * - CV deletion
 */
export const cvService = {
  /**
   * Create a new CV.
   */
  async createCV(
    userId: string,
    data: {
      title: string;
      slug?: string | null;
      status?: "DRAFT" | "PUBLISHED" | "ARCHIVED";
      visibility?: "PRIVATE" | "PUBLIC";
      isPublic?: boolean;
      templateId?: string | null;
      data?: Record<string, unknown>;
    },
  ) {
    return db.orm.public.CV.create({
      userId,
      title: data.title,
      slug: data.slug ?? null,
      status: data.status ?? "DRAFT",
      visibility: data.visibility ?? "PRIVATE",
      isPublic: data.isPublic ?? false,
      templateId: data.templateId ?? null,

      /**
       * Prisma 8 expects its generated JSON type here.
       */
      data: (data.data ?? {}) as any,

      version: 1,
    });
  },

  /**
   * Get all CVs owned by a user.
   */
  async getUserCVs(userId: string) {
    return db.orm.public.CV
      .where({ userId })
      .orderBy((cv) => cv.updatedAt.desc())
      .all();
  },

  /**
   * Get one CV by ID.
   *
   * Ownership is checked using both CV ID and user ID.
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
   * Get the complete CV with every related section.
   */
  async getFullCV(userId: string, cvId: string) {
    /**
     * Verify CV ownership first.
     */
    const cv = await this.getCVById(userId, cvId);

    /**
     * Load all CV sections in parallel.
     */
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
      db.orm.public.PersonalInformation
        .where({ cvId })
        .first(),

      db.orm.public.ProfessionalSummary
        .where({ cvId })
        .first(),

      db.orm.public.Education
        .where({ cvId })
        .orderBy((item) => item.sortOrder.asc())
        .all(),

      db.orm.public.WorkExperience
        .where({ cvId })
        .orderBy((item) => item.sortOrder.asc())
        .all(),

      db.orm.public.Skill
        .where({ cvId })
        .orderBy((item) => item.sortOrder.asc())
        .all(),

      db.orm.public.Project
        .where({ cvId })
        .orderBy((item) => item.sortOrder.asc())
        .all(),

      db.orm.public.Certification
        .where({ cvId })
        .orderBy((item) => item.sortOrder.asc())
        .all(),

      db.orm.public.Language
        .where({ cvId })
        .orderBy((item) => item.sortOrder.asc())
        .all(),

      db.orm.public.Award
        .where({ cvId })
        .orderBy((item) => item.sortOrder.asc())
        .all(),

      db.orm.public.VolunteerExperience
        .where({ cvId })
        .orderBy((item) => item.sortOrder.asc())
        .all(),

      db.orm.public.Publication
        .where({ cvId })
        .orderBy((item) => item.sortOrder.asc())
        .all(),

      db.orm.public.Conference
        .where({ cvId })
        .orderBy((item) => item.sortOrder.asc())
        .all(),

      db.orm.public.Course
        .where({ cvId })
        .orderBy((item) => item.sortOrder.asc())
        .all(),

      db.orm.public.Membership
        .where({ cvId })
        .orderBy((item) => item.sortOrder.asc())
        .all(),

      db.orm.public.TeachingExperience
        .where({ cvId })
        .orderBy((item) => item.sortOrder.asc())
        .all(),

      db.orm.public.LeadershipExperience
        .where({ cvId })
        .orderBy((item) => item.sortOrder.asc())
        .all(),

      db.orm.public.ExtracurricularActivity
        .where({ cvId })
        .orderBy((item) => item.sortOrder.asc())
        .all(),

      db.orm.public.Patent
        .where({ cvId })
        .orderBy((item) => item.sortOrder.asc())
        .all(),

      db.orm.public.Interest
        .where({ cvId })
        .orderBy((item) => item.sortOrder.asc())
        .all(),

      db.orm.public.Reference
        .where({ cvId })
        .orderBy((item) => item.sortOrder.asc())
        .all(),

      db.orm.public.CustomSection
        .where({ cvId })
        .orderBy((item) => item.sortOrder.asc())
        .all(),

      db.orm.public.CVSectionSetting
        .where({ cvId })
        .orderBy((item) => item.sortOrder.asc())
        .all(),
    ]);

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
   * Assign an active template to a CV.
   *
   * Verifies:
   * - The CV belongs to the authenticated user.
   * - The requested template exists.
   * - The requested template is active.
   */
  async updateTemplate(
    userId: string,
    cvId: string,
    templateId: string,
  ) {
    /**
     * Verify CV ownership before changing anything.
     */
    const cv = await db.orm.public.CV
      .where({
        id: cvId,
        userId,
      })
      .first();

    if (!cv) {
      throw new AppError("CV not found", 404);
    }

    /**
     * Only active templates can be assigned.
     */
    const template =
      await db.orm.public.Template
        .where({
          id: templateId,
          isActive: true,
        })
        .first();

    if (!template) {
      throw new AppError(
        "Template not found or inactive",
        404,
      );
    }

    /**
     * Update the CV with the selected template.
     */
    const updatedCV =
      await db.orm.public.CV
        .where({
          id: cvId,
          userId,
        })
        .update({
          templateId: template.id,
        });

    return {
      cv: updatedCV,
      template,
    };
  },

  /**
   * Update CV status.
   *
   * Supported transitions:
   *
   * DRAFT     → PUBLISHED / ARCHIVED
   * PUBLISHED → DRAFT / ARCHIVED
   * ARCHIVED  → DRAFT
   *
   * Submitting the current status again is allowed
   * and simply returns the existing CV.
   */
  async updateStatus(
    userId: string,
    cvId: string,
    status: "DRAFT" | "PUBLISHED" | "ARCHIVED",
  ) {
    const cv = await this.getCVById(userId, cvId);

    /**
     * If the requested status is already active,
     * no database update is necessary.
     */
    if (cv.status === status) {
      return cv;
    }

    /**
     * Define allowed status transitions.
     */
    const allowedTransitions: Record<
      "DRAFT" | "PUBLISHED" | "ARCHIVED",
      Array<"DRAFT" | "PUBLISHED" | "ARCHIVED">
    > = {
      DRAFT: ["PUBLISHED", "ARCHIVED"],
      PUBLISHED: ["DRAFT", "ARCHIVED"],
      ARCHIVED: ["DRAFT"],
    };

    const allowedStatuses = allowedTransitions[cv.status];

    /**
     * Reject invalid status transitions.
     */
    if (!allowedStatuses.includes(status)) {
      throw new AppError(
        `Cannot change CV status from ${cv.status} to ${status}`,
        400,
      );
    }

    /**
     * Update only the status field.
     */
    return db.orm.public.CV
      .where({ id: cvId })
      .update({
        status,
      });
  },

  /**
   * Duplicate an existing CV with all related sections.
   *
   * The duplicated CV:
   * - Belongs to the same user
   * - Gets a new ID
   * - Gets "Copy" appended to its title
   * - Starts as DRAFT
   * - Starts as PRIVATE
   * - Is not public
   * - Keeps the same template
   * - Copies the CV data
   * - Copies every related CV section
   *
   * All database writes happen inside one transaction.
   */
  async duplicateCV(userId: string, cvId: string) {
    /**
     * Find the source CV and verify ownership.
     */
    const sourceCV = await db.orm.public.CV
      .where({
        id: cvId,
        userId,
      })
      .first();

    if (!sourceCV) {
      throw new AppError("CV not found", 404);
    }

    /**
     * Load the complete source CV before starting
     * the write transaction.
     */
    const fullCV = await this.getFullCV(userId, cvId);

    /**
     * Start an atomic database transaction.
     */
    const newCV = await db.transaction(async (tx) => {
      /**
       * Create the new CV.
       */
      const duplicatedCV = await tx.orm.public.CV.create({
        userId,

        title: `${sourceCV.title} Copy`,

        /**
         * Do not copy the source slug because slugs
         * may need to remain unique.
         */
        slug: null,

        /**
         * Every duplicated CV starts as a draft.
         */
        status: "DRAFT",

        /**
         * Every duplicated CV starts as private.
         */
        visibility: "PRIVATE",

        isPublic: false,

        /**
         * Keep the same selected template.
         */
        templateId: sourceCV.templateId,

        /**
         * Copy the CV JSON data.
         */
        data: sourceCV.data,

        version: 1,
      });

      /**
       * Personal Information
       */
      if (fullCV.personalInformation) {
        const {
          id,
          cvId: _cvId,
          createdAt,
          updatedAt,
          ...data
        } = fullCV.personalInformation;

        await tx.orm.public.PersonalInformation.create({
          ...data,
          cvId: duplicatedCV.id,
        });
      }

      /**
       * Professional Summary
       */
      if (fullCV.summary) {
        const {
          id,
          cvId: _cvId,
          createdAt,
          updatedAt,
          ...data
        } = fullCV.summary;

        await tx.orm.public.ProfessionalSummary.create({
          ...data,
          cvId: duplicatedCV.id,
        });
      }

      /**
       * Education
       */
      for (const item of fullCV.education) {
        const {
          id,
          cvId: _cvId,
          createdAt,
          updatedAt,
          ...data
        } = item;

        await tx.orm.public.Education.create({
          ...data,
          cvId: duplicatedCV.id,
        });
      }

      /**
       * Work Experience
       */
      for (const item of fullCV.workExperience) {
        const {
          id,
          cvId: _cvId,
          createdAt,
          updatedAt,
          ...data
        } = item;

        await tx.orm.public.WorkExperience.create({
          ...data,
          cvId: duplicatedCV.id,
        });
      }

      /**
       * Skills
       */
      for (const item of fullCV.skills) {
        const {
          id,
          cvId: _cvId,
          createdAt,
          updatedAt,
          ...data
        } = item;

        await tx.orm.public.Skill.create({
          ...data,
          cvId: duplicatedCV.id,
        });
      }

      /**
       * Projects
       */
      for (const item of fullCV.projects) {
        const {
          id,
          cvId: _cvId,
          createdAt,
          updatedAt,
          ...data
        } = item;

        await tx.orm.public.Project.create({
          ...data,
          cvId: duplicatedCV.id,
        });
      }

      /**
       * Certifications
       */
      for (const item of fullCV.certifications) {
        const {
          id,
          cvId: _cvId,
          createdAt,
          updatedAt,
          ...data
        } = item;

        await tx.orm.public.Certification.create({
          ...data,
          cvId: duplicatedCV.id,
        });
      }

      /**
       * Languages
       */
      for (const item of fullCV.languages) {
        const {
          id,
          cvId: _cvId,
          createdAt,
          updatedAt,
          ...data
        } = item;

        await tx.orm.public.Language.create({
          ...data,
          cvId: duplicatedCV.id,
        });
      }

      /**
       * Awards
       */
      for (const item of fullCV.awards) {
        const {
          id,
          cvId: _cvId,
          createdAt,
          updatedAt,
          ...data
        } = item;

        await tx.orm.public.Award.create({
          ...data,
          cvId: duplicatedCV.id,
        });
      }

      /**
       * Volunteer Experience
       */
      for (const item of fullCV.volunteerExperience) {
        const {
          id,
          cvId: _cvId,
          createdAt,
          updatedAt,
          ...data
        } = item;

        await tx.orm.public.VolunteerExperience.create({
          ...data,
          cvId: duplicatedCV.id,
        });
      }

      /**
       * Publications
       */
      for (const item of fullCV.publications) {
        const {
          id,
          cvId: _cvId,
          createdAt,
          updatedAt,
          ...data
        } = item;

        await tx.orm.public.Publication.create({
          ...data,
          cvId: duplicatedCV.id,
        });
      }

      /**
       * Conferences
       */
      for (const item of fullCV.conferences) {
        const {
          id,
          cvId: _cvId,
          createdAt,
          updatedAt,
          ...data
        } = item;

        await tx.orm.public.Conference.create({
          ...data,
          cvId: duplicatedCV.id,
        });
      }

      /**
       * Courses / Training
       */
      for (const item of fullCV.courses) {
        const {
          id,
          cvId: _cvId,
          createdAt,
          updatedAt,
          ...data
        } = item;

        await tx.orm.public.Course.create({
          ...data,
          cvId: duplicatedCV.id,
        });
      }

      /**
       * Memberships
       */
      for (const item of fullCV.memberships) {
        const {
          id,
          cvId: _cvId,
          createdAt,
          updatedAt,
          ...data
        } = item;

        await tx.orm.public.Membership.create({
          ...data,
          cvId: duplicatedCV.id,
        });
      }

      /**
       * Teaching Experience
       */
      for (const item of fullCV.teachingExperience) {
        const {
          id,
          cvId: _cvId,
          createdAt,
          updatedAt,
          ...data
        } = item;

        await tx.orm.public.TeachingExperience.create({
          ...data,
          cvId: duplicatedCV.id,
        });
      }

      /**
       * Leadership Experience
       */
      for (const item of fullCV.leadershipExperience) {
        const {
          id,
          cvId: _cvId,
          createdAt,
          updatedAt,
          ...data
        } = item;

        await tx.orm.public.LeadershipExperience.create({
          ...data,
          cvId: duplicatedCV.id,
        });
      }

      /**
       * Extracurricular Activities
       */
      for (const item of fullCV.activities) {
        const {
          id,
          cvId: _cvId,
          createdAt,
          updatedAt,
          ...data
        } = item;

        await tx.orm.public.ExtracurricularActivity.create({
          ...data,
          cvId: duplicatedCV.id,
        });
      }

      /**
       * Patents
       */
      for (const item of fullCV.patents) {
        const {
          id,
          cvId: _cvId,
          createdAt,
          updatedAt,
          ...data
        } = item;

        await tx.orm.public.Patent.create({
          ...data,
          cvId: duplicatedCV.id,
        });
      }

      /**
       * Interests
       */
      for (const item of fullCV.interests) {
        const {
          id,
          cvId: _cvId,
          createdAt,
          updatedAt,
          ...data
        } = item;

        await tx.orm.public.Interest.create({
          ...data,
          cvId: duplicatedCV.id,
        });
      }

      /**
       * References
       */
      for (const item of fullCV.references) {
        const {
          id,
          cvId: _cvId,
          createdAt,
          updatedAt,
          ...data
        } = item;

        await tx.orm.public.Reference.create({
          ...data,
          cvId: duplicatedCV.id,
        });
      }

      /**
       * Custom Sections
       */
      for (const item of fullCV.customSections) {
        const {
          id,
          cvId: _cvId,
          createdAt,
          updatedAt,
          ...data
        } = item;

        await tx.orm.public.CustomSection.create({
          ...data,
          cvId: duplicatedCV.id,
        });
      }

      /**
       * CV Section Settings
       */
      for (const item of fullCV.sectionSettings) {
        const {
          id,
          cvId: _cvId,
          createdAt,
          updatedAt,
          ...data
        } = item;

        await tx.orm.public.CVSectionSetting.create({
          ...data,
          cvId: duplicatedCV.id,
        });
      }

      return duplicatedCV;
    });

    /**
     * Fetch the newly created CV with all sections.
     */
    return this.getFullCV(userId, newCV.id);
  },

  /**
   * Update CV core information.
   *
   * IMPORTANT SECURITY BOUNDARY:
   * - Only generic CV fields are allowed here.
   * - Status must be changed through updateStatus().
   * - Public visibility must be changed through the public settings service.
   * - Template assignment must be changed through updateTemplate().
   */
  async updateCV(
    userId: string,
    cvId: string,
    data: {
      title?: string;
      data?: Record<string, unknown>;
    },
  ) {
    await this.getCVById(userId, cvId);

    const updateData = {
      ...(data.title !== undefined
        ? { title: data.title }
        : {}),

      ...(data.data !== undefined
        ? { data: data.data as any }
        : {}),
    };

    return db.orm.public.CV
      .where({ id: cvId })
      .update(updateData);
  },

  /**
   * Delete a CV.
   *
   * Related CV records are removed through the database
   * cascade relations defined in the Prisma schema.
   */
  async deleteCV(userId: string, cvId: string) {
    /**
     * Verify ownership before deleting.
     */
    await this.getCVById(userId, cvId);

    return db.orm.public.CV
      .where({ id: cvId })
      .delete();
  },
};
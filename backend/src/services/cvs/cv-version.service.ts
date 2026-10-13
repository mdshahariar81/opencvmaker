import { db } from "../../config/database.js";
import { AppError } from "../../errors/app-error.js";

/**
 * CV Version Service
 *
 * Handles version history for CVs.
 *
 * Responsibilities:
 * - Verify CV ownership
 * - Create complete CV snapshots
 * - List CV versions
 * - Read a specific CV version
 * - Restore an older CV version
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
   * Create a complete CV version snapshot.
   *
   * The snapshot contains:
   * - CV core information
   * - Personal information
   * - Professional summary
   * - All CV sections
   * - Section settings
   */
  async createVersion(userId: string, cvId: string) {
    const cv = await this.verifyCVOwnership(userId, cvId);

    /**
     * Load every CV section separately.
     *
     * Prisma 8 contract does not support the relation
     * include syntax used by the previous implementation.
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
        .all(),

      db.orm.public.WorkExperience
        .where({ cvId })
        .all(),

      db.orm.public.Skill
        .where({ cvId })
        .all(),

      db.orm.public.Project
        .where({ cvId })
        .all(),

      db.orm.public.Certification
        .where({ cvId })
        .all(),

      db.orm.public.Language
        .where({ cvId })
        .all(),

      db.orm.public.Award
        .where({ cvId })
        .all(),

      db.orm.public.VolunteerExperience
        .where({ cvId })
        .all(),

      db.orm.public.Publication
        .where({ cvId })
        .all(),

      db.orm.public.Conference
        .where({ cvId })
        .all(),

      db.orm.public.Course
        .where({ cvId })
        .all(),

      db.orm.public.Membership
        .where({ cvId })
        .all(),

      db.orm.public.TeachingExperience
        .where({ cvId })
        .all(),

      db.orm.public.LeadershipExperience
        .where({ cvId })
        .all(),

      db.orm.public.ExtracurricularActivity
        .where({ cvId })
        .all(),

      db.orm.public.Patent
        .where({ cvId })
        .all(),

      db.orm.public.Interest
        .where({ cvId })
        .all(),

      db.orm.public.Reference
        .where({ cvId })
        .all(),

      db.orm.public.CustomSection
        .where({ cvId })
        .all(),

      db.orm.public.CVSectionSetting
        .where({ cvId })
        .all(),
    ]);

    /**
     * Find the latest version number.
     */
    const latestVersion = await db.orm.public.CVVersion
      .where({
        cvId,
      })
      .orderBy((version) => version.version.desc())
      .first();

    const nextVersion = latestVersion
      ? latestVersion.version + 1
      : 1;

    /**
     * Build the complete CV snapshot.
     */
    const snapshot = {
      cv: {
        title: cv.title,
        slug: cv.slug,
        status: cv.status,
        visibility: cv.visibility,
        isPublic: cv.isPublic,
        templateId: cv.templateId,
        data: cv.data,
      },

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

    /**
     * Save the complete snapshot.
     */
    return db.orm.public.CVVersion.create({
      cvId,
      version: nextVersion,
      data: snapshot,
    });
  },

  /**
   * Get all versions of a CV.
   *
   * Newest version is returned first.
   */
  async getVersions(userId: string, cvId: string) {
    await this.verifyCVOwnership(userId, cvId);

    return db.orm.public.CVVersion
      .where({ cvId })
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
   * This restores:
   * - CV core information
   * - Personal information
   * - Professional summary
   * - Education
   * - Work experience
   * - Skills
   * - Projects
   * - Certifications
   * - Languages
   * - Awards
   * - Volunteer experience
   * - Publications
   * - Conferences
   * - Courses
   * - Memberships
   * - Teaching experience
   * - Leadership experience
   * - Extracurricular activities
   * - Patents
   * - Interests
   * - References
   * - Custom sections
   * - Section settings
   *
   * The restore operation is atomic.
   */
  async restoreVersion(
    userId: string,
    cvId: string,
    versionNumber: number,
  ) {
    /**
     * Verify ownership.
     */
    const cv = await this.verifyCVOwnership(userId, cvId);

    /**
     * Find the requested version.
     */
    const version = await db.orm.public.CVVersion
      .where({
        cvId,
        version: versionNumber,
      })
      .first();

    if (!version) {
      throw new AppError("CV version not found", 404);
    }

    /**
     * The version contains a complete CV snapshot.
     */
    const snapshot = version.data as any;

    if (!snapshot?.cv) {
      throw new AppError(
        "CV version snapshot is invalid",
        400,
      );
    }

    /**
     * Restore the complete CV atomically.
     *
     * If any operation fails, all changes are rolled back.
     */
    const result = await db.transaction(async (tx) => {
      /**
       * -----------------------------------------------------
       * Delete current relational CV data
       * -----------------------------------------------------
       */

      await tx.orm.public.PersonalInformation
        .where({ cvId })
        .delete();

      await tx.orm.public.ProfessionalSummary
        .where({ cvId })
        .delete();

      await tx.orm.public.Education
        .where({ cvId })
        .delete();

      await tx.orm.public.WorkExperience
        .where({ cvId })
        .delete();

      await tx.orm.public.Skill
        .where({ cvId })
        .delete();

      await tx.orm.public.Project
        .where({ cvId })
        .delete();

      await tx.orm.public.Certification
        .where({ cvId })
        .delete();

      await tx.orm.public.Language
        .where({ cvId })
        .delete();

      await tx.orm.public.Award
        .where({ cvId })
        .delete();

      await tx.orm.public.VolunteerExperience
        .where({ cvId })
        .delete();

      await tx.orm.public.Publication
        .where({ cvId })
        .delete();

      await tx.orm.public.Conference
        .where({ cvId })
        .delete();

      await tx.orm.public.Course
        .where({ cvId })
        .delete();

      await tx.orm.public.Membership
        .where({ cvId })
        .delete();

      await tx.orm.public.TeachingExperience
        .where({ cvId })
        .delete();

      await tx.orm.public.LeadershipExperience
        .where({ cvId })
        .delete();

      await tx.orm.public.ExtracurricularActivity
        .where({ cvId })
        .delete();

      await tx.orm.public.Patent
        .where({ cvId })
        .delete();

      await tx.orm.public.Interest
        .where({ cvId })
        .delete();

      await tx.orm.public.Reference
        .where({ cvId })
        .delete();

      await tx.orm.public.CustomSection
        .where({ cvId })
        .delete();

      await tx.orm.public.CVSectionSetting
        .where({ cvId })
        .delete();

      /**
       * -----------------------------------------------------
       * Restore CV core information
       * -----------------------------------------------------
       */
      const restoredCV = await tx.orm.public.CV
        .where({
          id: cv.id,
        })
        .update({
          title: snapshot.cv.title,
          slug: snapshot.cv.slug,
          status: snapshot.cv.status,
          visibility: snapshot.cv.visibility,
          isPublic: snapshot.cv.isPublic,
          templateId: snapshot.cv.templateId,
          data: snapshot.cv.data,
        });

      /**
       * -----------------------------------------------------
       * Restore Personal Information
       * -----------------------------------------------------
       */
      if (snapshot.personalInformation) {
        const {
          id,
          cvId: _cvId,
          createdAt,
          updatedAt,
          ...data
        } = snapshot.personalInformation;

        await tx.orm.public.PersonalInformation.create({
          ...data,
          cvId,
        });
      }

      /**
       * -----------------------------------------------------
       * Restore Professional Summary
       * -----------------------------------------------------
       */
      if (snapshot.summary) {
        const {
          id,
          cvId: _cvId,
          createdAt,
          updatedAt,
          ...data
        } = snapshot.summary;

        await tx.orm.public.ProfessionalSummary.create({
          ...data,
          cvId,
        });
      }

      /**
       * -----------------------------------------------------
       * Restore Education
       * -----------------------------------------------------
       */
      for (const item of snapshot.education ?? []) {
        const {
          id,
          cvId: _cvId,
          createdAt,
          updatedAt,
          ...data
        } = item;

        await tx.orm.public.Education.create({
          ...data,
          cvId,
        });
      }

      /**
       * -----------------------------------------------------
       * Restore Work Experience
       * -----------------------------------------------------
       */
      for (const item of snapshot.workExperience ?? []) {
        const {
          id,
          cvId: _cvId,
          createdAt,
          updatedAt,
          ...data
        } = item;

        await tx.orm.public.WorkExperience.create({
          ...data,
          cvId,
        });
      }

      /**
       * -----------------------------------------------------
       * Restore Skills
       * -----------------------------------------------------
       */
      for (const item of snapshot.skills ?? []) {
        const {
          id,
          cvId: _cvId,
          createdAt,
          updatedAt,
          ...data
        } = item;

        await tx.orm.public.Skill.create({
          ...data,
          cvId,
        });
      }

      /**
       * -----------------------------------------------------
       * Restore Projects
       * -----------------------------------------------------
       */
      for (const item of snapshot.projects ?? []) {
        const {
          id,
          cvId: _cvId,
          createdAt,
          updatedAt,
          ...data
        } = item;

        await tx.orm.public.Project.create({
          ...data,
          cvId,
        });
      }

      /**
       * -----------------------------------------------------
       * Restore Certifications
       * -----------------------------------------------------
       */
      for (const item of snapshot.certifications ?? []) {
        const {
          id,
          cvId: _cvId,
          createdAt,
          updatedAt,
          ...data
        } = item;

        await tx.orm.public.Certification.create({
          ...data,
          cvId,
        });
      }

      /**
       * -----------------------------------------------------
       * Restore Languages
       * -----------------------------------------------------
       */
      for (const item of snapshot.languages ?? []) {
        const {
          id,
          cvId: _cvId,
          createdAt,
          updatedAt,
          ...data
        } = item;

        await tx.orm.public.Language.create({
          ...data,
          cvId,
        });
      }

      /**
       * -----------------------------------------------------
       * Restore Awards
       * -----------------------------------------------------
       */
      for (const item of snapshot.awards ?? []) {
        const {
          id,
          cvId: _cvId,
          createdAt,
          updatedAt,
          ...data
        } = item;

        await tx.orm.public.Award.create({
          ...data,
          cvId,
        });
      }

      /**
       * -----------------------------------------------------
       * Restore Volunteer Experience
       * -----------------------------------------------------
       */
      for (const item of snapshot.volunteerExperience ?? []) {
        const {
          id,
          cvId: _cvId,
          createdAt,
          updatedAt,
          ...data
        } = item;

        await tx.orm.public.VolunteerExperience.create({
          ...data,
          cvId,
        });
      }

      /**
       * -----------------------------------------------------
       * Restore Publications
       * -----------------------------------------------------
       */
      for (const item of snapshot.publications ?? []) {
        const {
          id,
          cvId: _cvId,
          createdAt,
          updatedAt,
          ...data
        } = item;

        await tx.orm.public.Publication.create({
          ...data,
          cvId,
        });
      }

      /**
       * -----------------------------------------------------
       * Restore Conferences
       * -----------------------------------------------------
       */
      for (const item of snapshot.conferences ?? []) {
        const {
          id,
          cvId: _cvId,
          createdAt,
          updatedAt,
          ...data
        } = item;

        await tx.orm.public.Conference.create({
          ...data,
          cvId,
        });
      }

      /**
       * -----------------------------------------------------
       * Restore Courses
       * -----------------------------------------------------
       */
      for (const item of snapshot.courses ?? []) {
        const {
          id,
          cvId: _cvId,
          createdAt,
          updatedAt,
          ...data
        } = item;

        await tx.orm.public.Course.create({
          ...data,
          cvId,
        });
      }

      /**
       * -----------------------------------------------------
       * Restore Memberships
       * -----------------------------------------------------
       */
      for (const item of snapshot.memberships ?? []) {
        const {
          id,
          cvId: _cvId,
          createdAt,
          updatedAt,
          ...data
        } = item;

        await tx.orm.public.Membership.create({
          ...data,
          cvId,
        });
      }

      /**
       * -----------------------------------------------------
       * Restore Teaching Experience
       * -----------------------------------------------------
       */
      for (const item of snapshot.teachingExperience ?? []) {
        const {
          id,
          cvId: _cvId,
          createdAt,
          updatedAt,
          ...data
        } = item;

        await tx.orm.public.TeachingExperience.create({
          ...data,
          cvId,
        });
      }

      /**
       * -----------------------------------------------------
       * Restore Leadership Experience
       * -----------------------------------------------------
       */
      for (const item of snapshot.leadershipExperience ?? []) {
        const {
          id,
          cvId: _cvId,
          createdAt,
          updatedAt,
          ...data
        } = item;

        await tx.orm.public.LeadershipExperience.create({
          ...data,
          cvId,
        });
      }

      /**
       * -----------------------------------------------------
       * Restore Extracurricular Activities
       * -----------------------------------------------------
       */
      for (const item of snapshot.activities ?? []) {
        const {
          id,
          cvId: _cvId,
          createdAt,
          updatedAt,
          ...data
        } = item;

        await tx.orm.public.ExtracurricularActivity.create({
          ...data,
          cvId,
        });
      }

      /**
       * -----------------------------------------------------
       * Restore Patents
       * -----------------------------------------------------
       */
      for (const item of snapshot.patents ?? []) {
        const {
          id,
          cvId: _cvId,
          createdAt,
          updatedAt,
          ...data
        } = item;

        await tx.orm.public.Patent.create({
          ...data,
          cvId,
        });
      }

      /**
       * -----------------------------------------------------
       * Restore Interests
       * -----------------------------------------------------
       */
      for (const item of snapshot.interests ?? []) {
        const {
          id,
          cvId: _cvId,
          createdAt,
          updatedAt,
          ...data
        } = item;

        await tx.orm.public.Interest.create({
          ...data,
          cvId,
        });
      }

      /**
       * -----------------------------------------------------
       * Restore References
       * -----------------------------------------------------
       */
      for (const item of snapshot.references ?? []) {
        const {
          id,
          cvId: _cvId,
          createdAt,
          updatedAt,
          ...data
        } = item;

        await tx.orm.public.Reference.create({
          ...data,
          cvId,
        });
      }

      /**
       * -----------------------------------------------------
       * Restore Custom Sections
       * -----------------------------------------------------
       */
      for (const item of snapshot.customSections ?? []) {
        const {
          id,
          cvId: _cvId,
          createdAt,
          updatedAt,
          ...data
        } = item;

        await tx.orm.public.CustomSection.create({
          ...data,
          cvId,
        });
      }

      /**
       * -----------------------------------------------------
       * Restore CV Section Settings
       * -----------------------------------------------------
       */
      for (const item of snapshot.sectionSettings ?? []) {
        const {
          id,
          cvId: _cvId,
          createdAt,
          updatedAt,
          ...data
        } = item;

        await tx.orm.public.CVSectionSetting.create({
          ...data,
          cvId,
        });
      }

      /**
       * -----------------------------------------------------
       * Create a new version for the restore action
       * -----------------------------------------------------
       */
      const latestVersion = await tx.orm.public.CVVersion
        .where({
          cvId,
        })
        .orderBy((item) => item.version.desc())
        .first();

      const nextVersion = latestVersion
        ? latestVersion.version + 1
        : 1;

      const restoredVersion =
        await tx.orm.public.CVVersion.create({
          cvId,
          version: nextVersion,
          data: version.data,
        });

      return {
        cv: restoredCV,
        restoredFromVersion: versionNumber,
        newVersion: restoredVersion,
      };
    });

    return result;
  },
};
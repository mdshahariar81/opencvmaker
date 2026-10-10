import { db } from "../../config/database.js";
import { AppError } from "../../errors/app-error.js";
import type { SkillInput } from "../../validation/cv/skill.schema.js";

/**
 * Skill service.
 *
 * Handles all database operations related to CV skills.
 *
 * Important:
 * - Every operation verifies CV ownership.
 * - One CV can contain multiple skills.
 * - The database prevents duplicate skill names
 *   within the same CV.
 */
export const skillService = {
  /**
   * Get all skills for a CV.
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

    return db.orm.public.Skill
      .where({
        cvId,
      })
      .all();
  },

  /**
   * Get one skill by ID.
   */
  async getById(
    userId: string,
    cvId: string,
    skillId: string,
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

    const skill = await db.orm.public.Skill
      .where({
        id: skillId,
        cvId,
      })
      .first();

    if (!skill) {
      throw new AppError("Skill not found", 404);
    }

    return skill;
  },

  /**
   * Create a new skill.
   */
  async create(
    userId: string,
    cvId: string,
    input: SkillInput,
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

    /**
     * The database has a unique constraint on
     * [cvId, name], so duplicate skills are not allowed
     * within the same CV.
     */
    const existingSkill = await db.orm.public.Skill
      .where({
        cvId,
        name: input.name,
      })
      .first();

    if (existingSkill) {
      throw new AppError(
        "This skill already exists in the CV",
        409,
      );
    }

    return db.orm.public.Skill.create({
      cvId,
      name: input.name,
      category: input.category,
      level: input.level,
      sortOrder: input.sortOrder ?? 0,
    });
  },

  /**
   * Update an existing skill.
   *
   * Only fields provided by the client are updated.
   */
  async update(
    userId: string,
    cvId: string,
    skillId: string,
    input: Partial<SkillInput>,
  ) {
    const existingSkill = await this.getById(
      userId,
      cvId,
      skillId,
    );

    /**
     * If the skill name is being changed, make sure
     * another skill with the same name does not already
     * exist in this CV.
     */
    if (
      input.name !== undefined &&
      input.name !== existingSkill.name
    ) {
      const duplicateSkill = await db.orm.public.Skill
        .where({
          cvId,
          name: input.name,
        })
        .first();

      if (duplicateSkill) {
        throw new AppError(
          "This skill already exists in the CV",
          409,
        );
      }
    }

    const updateData = {
      name: input.name,
      category: input.category,
      level: input.level,
      sortOrder: input.sortOrder,
    };

    return db.orm.public.Skill
      .where({
        id: existingSkill.id,
      })
      .update(updateData);
  },

  /**
   * Delete a skill.
   */
  async delete(
    userId: string,
    cvId: string,
    skillId: string,
  ) {
    const existingSkill = await this.getById(
      userId,
      cvId,
      skillId,
    );

    await db.orm.public.Skill
      .where({
        id: existingSkill.id,
      })
      .delete();

    return {
      cvId,
      skillId,
    };
  },
};
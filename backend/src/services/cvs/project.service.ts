import { db } from "../../config/database.js";
import { AppError } from "../../errors/app-error.js";
import type { ProjectInput } from "../../validation/cv/project.schema.js";
import type { TimestampString } from "@prisma/orm-postgres/target/codec-types";

/**
 * Converts an incoming ISO date string into the
 * TimestampString format expected by Prisma 8 ORM.
 */
function toTimestampString(
  value: string | undefined,
): TimestampString<3> | undefined {
  if (!value) {
    return undefined;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw new AppError("Invalid project date", 400);
  }

  const timestamp = date.toISOString().slice(0, 23);

  return timestamp as TimestampString<3>;
}

/**
 * Project service.
 *
 * Handles all database operations related to CV projects.
 *
 * Important:
 * - Every operation verifies CV ownership.
 * - One CV can contain multiple projects.
 * - Technologies are stored as a JSON array.
 */
export const projectService = {
  /**
   * Get all projects belonging to a CV.
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

    return db.orm.public.Project
      .where({
        cvId,
      })
      .all();
  },

  /**
   * Get a single project by ID.
   */
  async getById(
    userId: string,
    cvId: string,
    projectId: string,
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

    const project = await db.orm.public.Project
      .where({
        id: projectId,
        cvId,
      })
      .first();

    if (!project) {
      throw new AppError("Project not found", 404);
    }

    return project;
  },

  /**
   * Create a new project.
   */
  async create(
    userId: string,
    cvId: string,
    input: ProjectInput,
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

    return db.orm.public.Project.create({
      cvId,
      name: input.name,
      description: input.description,
      role: input.role,
      startDate: toTimestampString(input.startDate),
      endDate: toTimestampString(input.endDate),
      current: input.current ?? false,
      url: input.url,
      repository: input.repository,
      technologies: input.technologies,
      sortOrder: input.sortOrder ?? 0,
    });
  },

  /**
   * Update an existing project.
   */
  async update(
    userId: string,
    cvId: string,
    projectId: string,
    input: Partial<ProjectInput>,
  ) {
    const existingProject = await this.getById(
      userId,
      cvId,
      projectId,
    );

    const updateData = {
      name: input.name,
      description: input.description,
      role: input.role,
      startDate:
        input.startDate === undefined
          ? undefined
          : toTimestampString(input.startDate),
      endDate:
        input.endDate === undefined
          ? undefined
          : toTimestampString(input.endDate),
      current: input.current,
      url: input.url,
      repository: input.repository,
      technologies: input.technologies,
      sortOrder: input.sortOrder,
    };

    return db.orm.public.Project
      .where({
        id: existingProject.id,
      })
      .update(updateData);
  },

  /**
   * Delete an existing project.
   */
  async delete(
    userId: string,
    cvId: string,
    projectId: string,
  ) {
    const existingProject = await this.getById(
      userId,
      cvId,
      projectId,
    );

    await db.orm.public.Project
      .where({
        id: existingProject.id,
      })
      .delete();

    return {
      cvId,
      projectId,
    };
  },
};
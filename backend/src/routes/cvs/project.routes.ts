import type { FastifyInstance } from "fastify";

import { authenticate } from "../../middleware/authenticate.js";
import { cvIdParamSchema } from "../../validation/cv/cv.schema.js";
import {
  projectIdParamSchema,
  projectSchema,
} from "../../validation/cv/project.schema.js";
import { projectService } from "../../services/cvs/project.service.js";

/**
 * Project routes.
 *
 * All routes require authentication.
 *
 * CV ownership is verified inside the service using
 * the authenticated user's ID.
 */
export async function projectRoutes(app: FastifyInstance) {
  /**
   * Get all projects for a CV.
   */
  app.get(
    "/cvs/:id/projects",
    { preHandler: authenticate },
    async (request, reply) => {
      const { id: cvId } = cvIdParamSchema.parse(
        request.params,
      );

      const user = request.user as {
        sub: string;
      };

      const projects = await projectService.getAll(
        user.sub,
        cvId,
      );

      return reply.status(200).send({
        status: "success",
        projects,
      });
    },
  );

  /**
   * Get one project by ID.
   */
  app.get(
    "/cvs/:id/projects/:projectId",
    { preHandler: authenticate },
    async (request, reply) => {
      const { id: cvId } = cvIdParamSchema.parse(
        request.params,
      );

      const { projectId } =
        projectIdParamSchema.parse(request.params);

      const user = request.user as {
        sub: string;
      };

      const project = await projectService.getById(
        user.sub,
        cvId,
        projectId,
      );

      return reply.status(200).send({
        status: "success",
        project,
      });
    },
  );

  /**
   * Create a new project.
   */
  app.post(
    "/cvs/:id/projects",
    { preHandler: authenticate },
    async (request, reply) => {
      const { id: cvId } = cvIdParamSchema.parse(
        request.params,
      );

      const input = projectSchema.parse(request.body);

      const user = request.user as {
        sub: string;
      };

      const project = await projectService.create(
        user.sub,
        cvId,
        input,
      );

      return reply.status(201).send({
        status: "success",
        message: "Project added successfully",
        project,
      });
    },
  );

  /**
   * Update an existing project.
   */
  app.patch(
    "/cvs/:id/projects/:projectId",
    { preHandler: authenticate },
    async (request, reply) => {
      const { id: cvId } = cvIdParamSchema.parse(
        request.params,
      );

      const { projectId } =
        projectIdParamSchema.parse(request.params);

      const input = projectSchema
        .partial()
        .refine(
          (data) => Object.keys(data).length > 0,
          {
            message:
              "At least one field is required for update",
          },
        )
        .parse(request.body);

      const user = request.user as {
        sub: string;
      };

      const project = await projectService.update(
        user.sub,
        cvId,
        projectId,
        input,
      );

      return reply.status(200).send({
        status: "success",
        message: "Project updated successfully",
        project,
      });
    },
  );

  /**
   * Delete a project.
   */
  app.delete(
    "/cvs/:id/projects/:projectId",
    { preHandler: authenticate },
    async (request, reply) => {
      const { id: cvId } = cvIdParamSchema.parse(
        request.params,
      );

      const { projectId } =
        projectIdParamSchema.parse(request.params);

      const user = request.user as {
        sub: string;
      };

      await projectService.delete(
        user.sub,
        cvId,
        projectId,
      );

      return reply.status(200).send({
        status: "success",
        message: "Project deleted successfully",
        cvId,
        projectId,
      });
    },
  );
}
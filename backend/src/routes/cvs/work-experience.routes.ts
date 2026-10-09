import type { FastifyInstance } from "fastify";

import { authenticate } from "../../middleware/authenticate.js";
import { cvIdParamSchema } from "../../validation/cv/cv.schema.js";
import {
  workExperienceIdParamSchema,
  workExperienceSchema,
} from "../../validation/cv/work-experience.schema.js";
import { workExperienceService } from "../../services/cvs/work-experience.service.js";

/**
 * Work Experience routes.
 *
 * All routes require authentication.
 *
 * CV ownership is verified inside the service using
 * the authenticated user's ID.
 */
export async function workExperienceRoutes(
  app: FastifyInstance,
) {
  /**
   * GET /cvs/:id/work-experience
   *
   * Get all work experience records for a CV.
   */
  app.get(
    "/cvs/:id/work-experience",
    { preHandler: authenticate },
    async (request, reply) => {
      const { id: cvId } = cvIdParamSchema.parse(
        request.params,
      );

      const user = request.user as {
        sub: string;
      };

      const workExperience =
        await workExperienceService.getAll(
          user.sub,
          cvId,
        );

      return reply.status(200).send({
        status: "success",
        workExperience,
      });
    },
  );

  /**
   * GET /cvs/:id/work-experience/:workExperienceId
   *
   * Get one specific work experience record.
   */
  app.get(
    "/cvs/:id/work-experience/:workExperienceId",
    { preHandler: authenticate },
    async (request, reply) => {
      const { id: cvId } = cvIdParamSchema.parse(
        request.params,
      );

      const { workExperienceId } =
        workExperienceIdParamSchema.parse(
          request.params,
        );

      const user = request.user as {
        sub: string;
      };

      const workExperience =
        await workExperienceService.getById(
          user.sub,
          cvId,
          workExperienceId,
        );

      return reply.status(200).send({
        status: "success",
        workExperience,
      });
    },
  );

  /**
   * POST /cvs/:id/work-experience
   *
   * Create a new work experience record.
   */
  app.post(
    "/cvs/:id/work-experience",
    { preHandler: authenticate },
    async (request, reply) => {
      const { id: cvId } = cvIdParamSchema.parse(
        request.params,
      );

      const input = workExperienceSchema.parse(
        request.body,
      );

      const user = request.user as {
        sub: string;
      };

      const workExperience =
        await workExperienceService.create(
          user.sub,
          cvId,
          input,
        );

      return reply.status(201).send({
        status: "success",
        message: "Work experience added successfully",
        workExperience,
      });
    },
  );

  /**
   * PATCH /cvs/:id/work-experience/:workExperienceId
   *
   * Update an existing work experience record.
   */
  app.patch(
    "/cvs/:id/work-experience/:workExperienceId",
    { preHandler: authenticate },
    async (request, reply) => {
      const { id: cvId } = cvIdParamSchema.parse(
        request.params,
      );

      const { workExperienceId } =
        workExperienceIdParamSchema.parse(
          request.params,
        );

      /**
       * Partial schema allows updating only the fields
       * that the client wants to change.
       */
      const input = workExperienceSchema
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

      const workExperience =
        await workExperienceService.update(
          user.sub,
          cvId,
          workExperienceId,
          input,
        );

      return reply.status(200).send({
        status: "success",
        message: "Work experience updated successfully",
        workExperience,
      });
    },
  );

  /**
   * DELETE /cvs/:id/work-experience/:workExperienceId
   *
   * Delete one work experience record.
   */
  app.delete(
    "/cvs/:id/work-experience/:workExperienceId",
    { preHandler: authenticate },
    async (request, reply) => {
      const { id: cvId } = cvIdParamSchema.parse(
        request.params,
      );

      const { workExperienceId } =
        workExperienceIdParamSchema.parse(
          request.params,
        );

      const user = request.user as {
        sub: string;
      };

      await workExperienceService.delete(
        user.sub,
        cvId,
        workExperienceId,
      );

      return reply.status(200).send({
        status: "success",
        message: "Work experience deleted successfully",
        cvId,
        workExperienceId,
      });
    },
  );
}
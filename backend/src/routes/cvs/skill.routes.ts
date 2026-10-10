import type { FastifyInstance } from "fastify";

import { authenticate } from "../../middleware/authenticate.js";
import { cvIdParamSchema } from "../../validation/cv/cv.schema.js";
import {
  skillIdParamSchema,
  skillSchema,
} from "../../validation/cv/skill.schema.js";
import { skillService } from "../../services/cvs/skill.service.js";

/**
 * Skill routes.
 *
 * All routes require authentication.
 *
 * CV ownership is verified inside the service using
 * the authenticated user's ID.
 */
export async function skillRoutes(app: FastifyInstance) {
  /**
   * GET /cvs/:id/skills
   *
   * Get all skills for a CV.
   */
  app.get(
    "/cvs/:id/skills",
    { preHandler: authenticate },
    async (request, reply) => {
      const { id: cvId } = cvIdParamSchema.parse(
        request.params,
      );

      const user = request.user as {
        sub: string;
      };

      const skills = await skillService.getAll(
        user.sub,
        cvId,
      );

      return reply.status(200).send({
        status: "success",
        skills,
      });
    },
  );

  /**
   * GET /cvs/:id/skills/:skillId
   *
   * Get one specific skill.
   */
  app.get(
    "/cvs/:id/skills/:skillId",
    { preHandler: authenticate },
    async (request, reply) => {
      const { id: cvId } = cvIdParamSchema.parse(
        request.params,
      );

      const { skillId } = skillIdParamSchema.parse(
        request.params,
      );

      const user = request.user as {
        sub: string;
      };

      const skill = await skillService.getById(
        user.sub,
        cvId,
        skillId,
      );

      return reply.status(200).send({
        status: "success",
        skill,
      });
    },
  );

  /**
   * POST /cvs/:id/skills
   *
   * Create a new skill.
   */
  app.post(
    "/cvs/:id/skills",
    { preHandler: authenticate },
    async (request, reply) => {
      const { id: cvId } = cvIdParamSchema.parse(
        request.params,
      );

      const input = skillSchema.parse(request.body);

      const user = request.user as {
        sub: string;
      };

      const skill = await skillService.create(
        user.sub,
        cvId,
        input,
      );

      return reply.status(201).send({
        status: "success",
        message: "Skill added successfully",
        skill,
      });
    },
  );

  /**
   * PATCH /cvs/:id/skills/:skillId
   *
   * Update an existing skill.
   */
  app.patch(
    "/cvs/:id/skills/:skillId",
    { preHandler: authenticate },
    async (request, reply) => {
      const { id: cvId } = cvIdParamSchema.parse(
        request.params,
      );

      const { skillId } = skillIdParamSchema.parse(
        request.params,
      );

      /**
       * Partial schema allows updating only the fields
       * that the client wants to change.
       */
      const input = skillSchema
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

      const skill = await skillService.update(
        user.sub,
        cvId,
        skillId,
        input,
      );

      return reply.status(200).send({
        status: "success",
        message: "Skill updated successfully",
        skill,
      });
    },
  );

  /**
   * DELETE /cvs/:id/skills/:skillId
   *
   * Delete one skill.
   */
  app.delete(
    "/cvs/:id/skills/:skillId",
    { preHandler: authenticate },
    async (request, reply) => {
      const { id: cvId } = cvIdParamSchema.parse(
        request.params,
      );

      const { skillId } = skillIdParamSchema.parse(
        request.params,
      );

      const user = request.user as {
        sub: string;
      };

      await skillService.delete(
        user.sub,
        cvId,
        skillId,
      );

      return reply.status(200).send({
        status: "success",
        message: "Skill deleted successfully",
        cvId,
        skillId,
      });
    },
  );
}
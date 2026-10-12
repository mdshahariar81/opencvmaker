import type { FastifyInstance } from "fastify";

import { authenticate } from "../../middleware/authenticate.js";
import {
  leadershipExperienceService,
} from "../../services/cvs/leadership-experience.service.js";

import { cvIdParamSchema } from "../../validation/cv/cv.schema.js";
import {
  leadershipExperienceIdParamSchema,
  leadershipExperienceSchema,
} from "../../validation/cv/leadership-experience.schema.js";

/**
 * Leadership Experience routes.
 *
 * All endpoints require authentication.
 * CV ownership is checked by the service layer.
 */
export async function leadershipExperienceRoutes(
  app: FastifyInstance,
) {
  // Get all leadership experience records for a CV.
  app.get(
    "/cvs/:id/leadership-experience",
    { preHandler: authenticate },
    async (request, reply) => {
      const { id: cvId } =
        cvIdParamSchema.parse(request.params);

      const user = request.user as { sub: string };

      const experiences =
        await leadershipExperienceService.getAll(
          user.sub,
          cvId,
        );

      return reply.status(200).send({
        status: "success",
        leadershipExperience: experiences,
      });
    },
  );

  // Get one leadership experience record.
  app.get(
    "/cvs/:id/leadership-experience/:leadershipExperienceId",
    { preHandler: authenticate },
    async (request, reply) => {
      const { id: cvId } =
        cvIdParamSchema.parse(request.params);

      const { leadershipExperienceId } =
        leadershipExperienceIdParamSchema.parse(
          request.params,
        );

      const user = request.user as { sub: string };

      const experience =
        await leadershipExperienceService.getById(
          user.sub,
          cvId,
          leadershipExperienceId,
        );

      return reply.status(200).send({
        status: "success",
        leadershipExperience: experience,
      });
    },
  );

  // Create a leadership experience record.
  app.post(
    "/cvs/:id/leadership-experience",
    { preHandler: authenticate },
    async (request, reply) => {
      const { id: cvId } =
        cvIdParamSchema.parse(request.params);

      const input =
        leadershipExperienceSchema.parse(
          request.body,
        );

      const user = request.user as { sub: string };

      const experience =
        await leadershipExperienceService.create(
          user.sub,
          cvId,
          input,
        );

      return reply.status(201).send({
        status: "success",
        message:
          "Leadership experience added successfully",
        leadershipExperience: experience,
      });
    },
  );

  // Update a leadership experience record.
  app.patch(
    "/cvs/:id/leadership-experience/:leadershipExperienceId",
    { preHandler: authenticate },
    async (request, reply) => {
      const { id: cvId } =
        cvIdParamSchema.parse(request.params);

      const { leadershipExperienceId } =
        leadershipExperienceIdParamSchema.parse(
          request.params,
        );

      const input = leadershipExperienceSchema
        .partial()
        .refine(
          (data) => Object.keys(data).length > 0,
          {
            message:
              "At least one field is required for update",
          },
        )
        .parse(request.body);

      const user = request.user as { sub: string };

      const experience =
        await leadershipExperienceService.update(
          user.sub,
          cvId,
          leadershipExperienceId,
          input,
        );

      return reply.status(200).send({
        status: "success",
        message:
          "Leadership experience updated successfully",
        leadershipExperience: experience,
      });
    },
  );

  // Delete a leadership experience record.
  app.delete(
    "/cvs/:id/leadership-experience/:leadershipExperienceId",
    { preHandler: authenticate },
    async (request, reply) => {
      const { id: cvId } =
        cvIdParamSchema.parse(request.params);

      const { leadershipExperienceId } =
        leadershipExperienceIdParamSchema.parse(
          request.params,
        );

      const user = request.user as { sub: string };

      const result =
        await leadershipExperienceService.delete(
          user.sub,
          cvId,
          leadershipExperienceId,
        );

      return reply.status(200).send({
        status: "success",
        message:
          "Leadership experience deleted successfully",
        ...result,
      });
    },
  );
}
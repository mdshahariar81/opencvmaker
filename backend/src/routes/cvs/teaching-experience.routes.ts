import type { FastifyInstance } from "fastify";

import { authenticate } from "../../middleware/authenticate.js";
import {
  teachingExperienceService,
} from "../../services/cvs/teaching-experience.service.js";

import { cvIdParamSchema } from "../../validation/cv/cv.schema.js";
import {
  teachingExperienceIdParamSchema,
  teachingExperienceSchema,
} from "../../validation/cv/teaching-experience.schema.js";

/**
 * Teaching Experience routes.
 *
 * All endpoints require authentication.
 * CV ownership is checked by the service layer.
 */
export async function teachingExperienceRoutes(
  app: FastifyInstance,
) {
  // Get all teaching experience records for a CV.
  app.get(
    "/cvs/:id/teaching-experience",
    { preHandler: authenticate },
    async (request, reply) => {
      const { id: cvId } =
        cvIdParamSchema.parse(request.params);

      const user = request.user as { sub: string };

      const experiences =
        await teachingExperienceService.getAll(
          user.sub,
          cvId,
        );

      return reply.status(200).send({
        status: "success",
        teachingExperience: experiences,
      });
    },
  );

  // Get one teaching experience record.
  app.get(
    "/cvs/:id/teaching-experience/:teachingExperienceId",
    { preHandler: authenticate },
    async (request, reply) => {
      const { id: cvId } =
        cvIdParamSchema.parse(request.params);

      const { teachingExperienceId } =
        teachingExperienceIdParamSchema.parse(
          request.params,
        );

      const user = request.user as { sub: string };

      const experience =
        await teachingExperienceService.getById(
          user.sub,
          cvId,
          teachingExperienceId,
        );

      return reply.status(200).send({
        status: "success",
        teachingExperience: experience,
      });
    },
  );

  // Create a teaching experience record.
  app.post(
    "/cvs/:id/teaching-experience",
    { preHandler: authenticate },
    async (request, reply) => {
      const { id: cvId } =
        cvIdParamSchema.parse(request.params);

      const input =
        teachingExperienceSchema.parse(request.body);

      const user = request.user as { sub: string };

      const experience =
        await teachingExperienceService.create(
          user.sub,
          cvId,
          input,
        );

      return reply.status(201).send({
        status: "success",
        message: "Teaching experience added successfully",
        teachingExperience: experience,
      });
    },
  );

  // Update a teaching experience record.
  app.patch(
    "/cvs/:id/teaching-experience/:teachingExperienceId",
    { preHandler: authenticate },
    async (request, reply) => {
      const { id: cvId } =
        cvIdParamSchema.parse(request.params);

      const { teachingExperienceId } =
        teachingExperienceIdParamSchema.parse(
          request.params,
        );

      const input = teachingExperienceSchema
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
        await teachingExperienceService.update(
          user.sub,
          cvId,
          teachingExperienceId,
          input,
        );

      return reply.status(200).send({
        status: "success",
        message: "Teaching experience updated successfully",
        teachingExperience: experience,
      });
    },
  );

  // Delete a teaching experience record.
  app.delete(
    "/cvs/:id/teaching-experience/:teachingExperienceId",
    { preHandler: authenticate },
    async (request, reply) => {
      const { id: cvId } =
        cvIdParamSchema.parse(request.params);

      const { teachingExperienceId } =
        teachingExperienceIdParamSchema.parse(
          request.params,
        );

      const user = request.user as { sub: string };

      const result =
        await teachingExperienceService.delete(
          user.sub,
          cvId,
          teachingExperienceId,
        );

      return reply.status(200).send({
        status: "success",
        message: "Teaching experience deleted successfully",
        ...result,
      });
    },
  );
}
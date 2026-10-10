import type { FastifyInstance } from "fastify";

import { authenticate } from "../../middleware/authenticate.js";
import { volunteerExperienceService } from "../../services/cvs/volunteer-experience.service.js";

import { cvIdParamSchema } from "../../validation/cv/cv.schema.js";
import {
  volunteerExperienceIdParamSchema,
  volunteerExperienceSchema,
} from "../../validation/cv/volunteer-experience.schema.js";

/**
 * Volunteer Experience routes.
 *
 * All routes require authentication.
 * CV ownership is verified inside the service layer.
 */
export async function volunteerExperienceRoutes(
  app: FastifyInstance,
) {
  // Get all volunteer experiences belonging to a CV.
  app.get(
    "/cvs/:id/volunteer-experiences",
    { preHandler: authenticate },
    async (request, reply) => {
      const { id: cvId } =
        cvIdParamSchema.parse(request.params);

      const user = request.user as {
        sub: string;
      };

      const volunteerExperiences =
        await volunteerExperienceService.getAll(
          user.sub,
          cvId,
        );

      return reply.status(200).send({
        status: "success",
        volunteerExperiences,
      });
    },
  );

  // Get a single volunteer experience by ID.
  app.get(
    "/cvs/:id/volunteer-experiences/:volunteerExperienceId",
    { preHandler: authenticate },
    async (request, reply) => {
      const { id: cvId } =
        cvIdParamSchema.parse(request.params);

      const { volunteerExperienceId } =
        volunteerExperienceIdParamSchema.parse(
          request.params,
        );

      const user = request.user as {
        sub: string;
      };

      const volunteerExperience =
        await volunteerExperienceService.getById(
          user.sub,
          cvId,
          volunteerExperienceId,
        );

      return reply.status(200).send({
        status: "success",
        volunteerExperience,
      });
    },
  );

  // Create a new volunteer experience.
  app.post(
    "/cvs/:id/volunteer-experiences",
    { preHandler: authenticate },
    async (request, reply) => {
      const { id: cvId } =
        cvIdParamSchema.parse(request.params);

      const input =
        volunteerExperienceSchema.parse(
          request.body,
        );

      const user = request.user as {
        sub: string;
      };

      const volunteerExperience =
        await volunteerExperienceService.create(
          user.sub,
          cvId,
          input,
        );

      return reply.status(201).send({
        status: "success",
        message:
          "Volunteer experience added successfully",
        volunteerExperience,
      });
    },
  );

  // Update an existing volunteer experience.
  app.patch(
    "/cvs/:id/volunteer-experiences/:volunteerExperienceId",
    { preHandler: authenticate },
    async (request, reply) => {
      const { id: cvId } =
        cvIdParamSchema.parse(request.params);

      const { volunteerExperienceId } =
        volunteerExperienceIdParamSchema.parse(
          request.params,
        );

      const input = volunteerExperienceSchema
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

      const volunteerExperience =
        await volunteerExperienceService.update(
          user.sub,
          cvId,
          volunteerExperienceId,
          input,
        );

      return reply.status(200).send({
        status: "success",
        message:
          "Volunteer experience updated successfully",
        volunteerExperience,
      });
    },
  );

  // Delete a volunteer experience.
  app.delete(
    "/cvs/:id/volunteer-experiences/:volunteerExperienceId",
    { preHandler: authenticate },
    async (request, reply) => {
      const { id: cvId } =
        cvIdParamSchema.parse(request.params);

      const { volunteerExperienceId } =
        volunteerExperienceIdParamSchema.parse(
          request.params,
        );

      const user = request.user as {
        sub: string;
      };

      const result =
        await volunteerExperienceService.delete(
          user.sub,
          cvId,
          volunteerExperienceId,
        );

      return reply.status(200).send({
        status: "success",
        message:
          "Volunteer experience deleted successfully",
        ...result,
      });
    },
  );
}

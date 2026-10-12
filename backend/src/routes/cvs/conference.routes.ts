import type { FastifyInstance } from "fastify";

import { authenticate } from "../../middleware/authenticate.js";
import { conferenceService } from "../../services/cvs/conference.service.js";

import { cvIdParamSchema } from "../../validation/cv/cv.schema.js";
import {
  conferenceIdParamSchema,
  conferenceSchema,
} from "../../validation/cv/conference.schema.js";

/**
 * Conference routes.
 *
 * All routes require authentication.
 * CV ownership is verified inside the service layer.
 */
export async function conferenceRoutes(
  app: FastifyInstance,
) {
  /**
   * Get all conferences for a CV.
   */
  app.get(
    "/cvs/:id/conferences",
    { preHandler: authenticate },
    async (request, reply) => {
      const { id: cvId } =
        cvIdParamSchema.parse(request.params);

      const user = request.user as {
        sub: string;
      };

      const conferences =
        await conferenceService.getAll(
          user.sub,
          cvId,
        );

      return reply.status(200).send({
        status: "success",
        conferences,
      });
    },
  );

  /**
   * Get a single conference.
   */
  app.get(
    "/cvs/:id/conferences/:conferenceId",
    { preHandler: authenticate },
    async (request, reply) => {
      const { id: cvId } =
        cvIdParamSchema.parse(request.params);

      const { conferenceId } =
        conferenceIdParamSchema.parse(
          request.params,
        );

      const user = request.user as {
        sub: string;
      };

      const conference =
        await conferenceService.getById(
          user.sub,
          cvId,
          conferenceId,
        );

      return reply.status(200).send({
        status: "success",
        conference,
      });
    },
  );

  /**
   * Create a conference.
   */
  app.post(
    "/cvs/:id/conferences",
    { preHandler: authenticate },
    async (request, reply) => {
      const { id: cvId } =
        cvIdParamSchema.parse(request.params);

      const input =
        conferenceSchema.parse(request.body);

      const user = request.user as {
        sub: string;
      };

      const conference =
        await conferenceService.create(
          user.sub,
          cvId,
          input,
        );

      return reply.status(201).send({
        status: "success",
        message:
          "Conference added successfully",
        conference,
      });
    },
  );

  /**
   * Update a conference.
   */
  app.patch(
    "/cvs/:id/conferences/:conferenceId",
    { preHandler: authenticate },
    async (request, reply) => {
      const { id: cvId } =
        cvIdParamSchema.parse(request.params);

      const { conferenceId } =
        conferenceIdParamSchema.parse(
          request.params,
        );

      const input = conferenceSchema
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

      const conference =
        await conferenceService.update(
          user.sub,
          cvId,
          conferenceId,
          input,
        );

      return reply.status(200).send({
        status: "success",
        message:
          "Conference updated successfully",
        conference,
      });
    },
  );

  /**
   * Delete a conference.
   */
  app.delete(
    "/cvs/:id/conferences/:conferenceId",
    { preHandler: authenticate },
    async (request, reply) => {
      const { id: cvId } =
        cvIdParamSchema.parse(request.params);

      const { conferenceId } =
        conferenceIdParamSchema.parse(
          request.params,
        );

      const user = request.user as {
        sub: string;
      };

      const result =
        await conferenceService.delete(
          user.sub,
          cvId,
          conferenceId,
        );

      return reply.status(200).send({
        status: "success",
        message:
          "Conference deleted successfully",
        ...result,
      });
    },
  );
}

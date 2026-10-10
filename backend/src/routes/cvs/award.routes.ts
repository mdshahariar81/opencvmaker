import type { FastifyInstance } from "fastify";

import { authenticate } from "../../middleware/authenticate.js";
import { awardService } from "../../services/cvs/award.service.js";

import { cvIdParamSchema } from "../../validation/cv/cv.schema.js";
import {
  awardIdParamSchema,
  awardSchema,
} from "../../validation/cv/award.schema.js";

/**
 * Award routes.
 *
 * All routes require authentication.
 * CV ownership is verified inside the service layer.
 */
export async function awardRoutes(
  app: FastifyInstance,
) {
  // Get all awards belonging to a CV.
  app.get(
    "/cvs/:id/awards",
    { preHandler: authenticate },
    async (request, reply) => {
      const { id: cvId } =
        cvIdParamSchema.parse(request.params);

      const user = request.user as {
        sub: string;
      };

      const awards =
        await awardService.getAll(
          user.sub,
          cvId,
        );

      return reply.status(200).send({
        status: "success",
        awards,
      });
    },
  );

  // Get a single award by ID.
  app.get(
    "/cvs/:id/awards/:awardId",
    { preHandler: authenticate },
    async (request, reply) => {
      const { id: cvId } =
        cvIdParamSchema.parse(request.params);

      const { awardId } =
        awardIdParamSchema.parse(
          request.params,
        );

      const user = request.user as {
        sub: string;
      };

      const award =
        await awardService.getById(
          user.sub,
          cvId,
          awardId,
        );

      return reply.status(200).send({
        status: "success",
        award,
      });
    },
  );

  // Create a new award.
  app.post(
    "/cvs/:id/awards",
    { preHandler: authenticate },
    async (request, reply) => {
      const { id: cvId } =
        cvIdParamSchema.parse(request.params);

      const input = awardSchema.parse(
        request.body,
      );

      const user = request.user as {
        sub: string;
      };

      const award =
        await awardService.create(
          user.sub,
          cvId,
          input,
        );

      return reply.status(201).send({
        status: "success",
        message: "Award added successfully",
        award,
      });
    },
  );

  // Update an existing award.
  app.patch(
    "/cvs/:id/awards/:awardId",
    { preHandler: authenticate },
    async (request, reply) => {
      const { id: cvId } =
        cvIdParamSchema.parse(request.params);

      const { awardId } =
        awardIdParamSchema.parse(
          request.params,
        );

      const input = awardSchema
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

      const award =
        await awardService.update(
          user.sub,
          cvId,
          awardId,
          input,
        );

      return reply.status(200).send({
        status: "success",
        message: "Award updated successfully",
        award,
      });
    },
  );

  // Delete an award.
  app.delete(
    "/cvs/:id/awards/:awardId",
    { preHandler: authenticate },
    async (request, reply) => {
      const { id: cvId } =
        cvIdParamSchema.parse(request.params);

      const { awardId } =
        awardIdParamSchema.parse(
          request.params,
        );

      const user = request.user as {
        sub: string;
      };

      const result =
        await awardService.delete(
          user.sub,
          cvId,
          awardId,
        );

      return reply.status(200).send({
        status: "success",
        message: "Award deleted successfully",
        ...result,
      });
    },
  );
}

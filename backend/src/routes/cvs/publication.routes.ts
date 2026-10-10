import type { FastifyInstance } from "fastify";

import { authenticate } from "../../middleware/authenticate.js";
import { publicationService } from "../../services/cvs/publication.service.js";

import { cvIdParamSchema } from "../../validation/cv/cv.schema.js";
import {
  publicationIdParamSchema,
  publicationSchema,
} from "../../validation/cv/publication.schema.js";

/**
 * Publication routes.
 *
 * All routes require authentication.
 * CV ownership is verified inside the service layer.
 */
export async function publicationRoutes(
  app: FastifyInstance,
) {
  // Get all publications belonging to a CV.
  app.get(
    "/cvs/:id/publications",
    { preHandler: authenticate },
    async (request, reply) => {
      const { id: cvId } =
        cvIdParamSchema.parse(request.params);

      const user = request.user as {
        sub: string;
      };

      const publications =
        await publicationService.getAll(
          user.sub,
          cvId,
        );

      return reply.status(200).send({
        status: "success",
        publications,
      });
    },
  );

  // Get a single publication by ID.
  app.get(
    "/cvs/:id/publications/:publicationId",
    { preHandler: authenticate },
    async (request, reply) => {
      const { id: cvId } =
        cvIdParamSchema.parse(request.params);

      const { publicationId } =
        publicationIdParamSchema.parse(
          request.params,
        );

      const user = request.user as {
        sub: string;
      };

      const publication =
        await publicationService.getById(
          user.sub,
          cvId,
          publicationId,
        );

      return reply.status(200).send({
        status: "success",
        publication,
      });
    },
  );

  // Create a new publication.
  app.post(
    "/cvs/:id/publications",
    { preHandler: authenticate },
    async (request, reply) => {
      const { id: cvId } =
        cvIdParamSchema.parse(request.params);

      const input =
        publicationSchema.parse(request.body);

      const user = request.user as {
        sub: string;
      };

      const publication =
        await publicationService.create(
          user.sub,
          cvId,
          input,
        );

      return reply.status(201).send({
        status: "success",
        message:
          "Publication added successfully",
        publication,
      });
    },
  );

  // Update an existing publication.
  app.patch(
    "/cvs/:id/publications/:publicationId",
    { preHandler: authenticate },
    async (request, reply) => {
      const { id: cvId } =
        cvIdParamSchema.parse(request.params);

      const { publicationId } =
        publicationIdParamSchema.parse(
          request.params,
        );

      const input = publicationSchema
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

      const publication =
        await publicationService.update(
          user.sub,
          cvId,
          publicationId,
          input,
        );

      return reply.status(200).send({
        status: "success",
        message:
          "Publication updated successfully",
        publication,
      });
    },
  );

  // Delete an existing publication.
  app.delete(
    "/cvs/:id/publications/:publicationId",
    { preHandler: authenticate },
    async (request, reply) => {
      const { id: cvId } =
        cvIdParamSchema.parse(request.params);

      const { publicationId } =
        publicationIdParamSchema.parse(
          request.params,
        );

      const user = request.user as {
        sub: string;
      };

      const result =
        await publicationService.delete(
          user.sub,
          cvId,
          publicationId,
        );

      return reply.status(200).send({
        status: "success",
        message:
          "Publication deleted successfully",
        ...result,
      });
    },
  );
}

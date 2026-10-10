import type { FastifyInstance } from "fastify";

import { authenticate } from "../../middleware/authenticate.js";
import { languageService } from "../../services/cvs/language.service.js";

import { cvIdParamSchema } from "../../validation/cv/cv.schema.js";
import {
  languageIdParamSchema,
  languageSchema,
} from "../../validation/cv/language.schema.js";

/**
 * Language routes.
 *
 * All routes require authentication.
 * CV ownership is verified inside the service layer.
 */
export async function languageRoutes(
  app: FastifyInstance,
) {
  // Get all languages belonging to a CV.
  app.get(
    "/cvs/:id/languages",
    { preHandler: authenticate },
    async (request, reply) => {
      const { id: cvId } =
        cvIdParamSchema.parse(request.params);

      const user = request.user as {
        sub: string;
      };

      const languages =
        await languageService.getAll(
          user.sub,
          cvId,
        );

      return reply.status(200).send({
        status: "success",
        languages,
      });
    },
  );

  // Get a single language by ID.
  app.get(
    "/cvs/:id/languages/:languageId",
    { preHandler: authenticate },
    async (request, reply) => {
      const { id: cvId } =
        cvIdParamSchema.parse(request.params);

      const { languageId } =
        languageIdParamSchema.parse(
          request.params,
        );

      const user = request.user as {
        sub: string;
      };

      const language =
        await languageService.getById(
          user.sub,
          cvId,
          languageId,
        );

      return reply.status(200).send({
        status: "success",
        language,
      });
    },
  );

  // Create a new language.
  app.post(
    "/cvs/:id/languages",
    { preHandler: authenticate },
    async (request, reply) => {
      const { id: cvId } =
        cvIdParamSchema.parse(request.params);

      const input = languageSchema.parse(
        request.body,
      );

      const user = request.user as {
        sub: string;
      };

      const language =
        await languageService.create(
          user.sub,
          cvId,
          input,
        );

      return reply.status(201).send({
        status: "success",
        message: "Language added successfully",
        language,
      });
    },
  );

  // Update an existing language.
  app.patch(
    "/cvs/:id/languages/:languageId",
    { preHandler: authenticate },
    async (request, reply) => {
      const { id: cvId } =
        cvIdParamSchema.parse(request.params);

      const { languageId } =
        languageIdParamSchema.parse(
          request.params,
        );

      const input = languageSchema
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

      const language =
        await languageService.update(
          user.sub,
          cvId,
          languageId,
          input,
        );

      return reply.status(200).send({
        status: "success",
        message: "Language updated successfully",
        language,
      });
    },
  );

  // Delete a language.
  app.delete(
    "/cvs/:id/languages/:languageId",
    { preHandler: authenticate },
    async (request, reply) => {
      const { id: cvId } =
        cvIdParamSchema.parse(request.params);

      const { languageId } =
        languageIdParamSchema.parse(
          request.params,
        );

      const user = request.user as {
        sub: string;
      };

      const result =
        await languageService.delete(
          user.sub,
          cvId,
          languageId,
        );

      return reply.status(200).send({
        status: "success",
        message: "Language deleted successfully",
        ...result,
      });
    },
  );
}

import type { FastifyInstance } from "fastify";

import { authenticate } from "../../middleware/authenticate.js";
import { cvIdParamSchema } from "../../validation/cv/cv.schema.js";
import {
  educationIdParamSchema,
  educationSchema,
} from "../../validation/cv/education.schema.js";
import { educationService } from "../../services/cvs/education.service.js";

/**
 * Education routes.
 *
 * All routes require authentication.
 *
 * CV ownership is verified inside the education service
 * using the authenticated user's ID.
 */
export async function educationRoutes(app: FastifyInstance) {
  /**
   * GET /cvs/:id/education
   *
   * Get all education records for a CV.
   */
  app.get(
    "/cvs/:id/education",
    { preHandler: authenticate },
    async (request, reply) => {
      const { id: cvId } = cvIdParamSchema.parse(
        request.params,
      );

      const user = request.user as {
        sub: string;
      };

      const education = await educationService.getAll(
        user.sub,
        cvId,
      );

      return reply.status(200).send({
        status: "success",
        education,
      });
    },
  );

  /**
   * GET /cvs/:id/education/:educationId
   *
   * Get one specific education record.
   */
  app.get(
    "/cvs/:id/education/:educationId",
    { preHandler: authenticate },
    async (request, reply) => {
      const { id: cvId } = cvIdParamSchema.parse(
        request.params,
      );

      const { educationId } =
        educationIdParamSchema.parse(request.params);

      const user = request.user as {
        sub: string;
      };

      const education = await educationService.getById(
        user.sub,
        cvId,
        educationId,
      );

      return reply.status(200).send({
        status: "success",
        education,
      });
    },
  );

  /**
   * POST /cvs/:id/education
   *
   * Create a new education record.
   */
  app.post(
    "/cvs/:id/education",
    { preHandler: authenticate },
    async (request, reply) => {
      const { id: cvId } = cvIdParamSchema.parse(
        request.params,
      );

      const input = educationSchema.parse(request.body);

      const user = request.user as {
        sub: string;
      };

      const education = await educationService.create(
        user.sub,
        cvId,
        input,
      );

      return reply.status(201).send({
        status: "success",
        message: "Education added successfully",
        education,
      });
    },
  );

  /**
   * PATCH /cvs/:id/education/:educationId
   *
   * Update an existing education record.
   */
  app.patch(
    "/cvs/:id/education/:educationId",
    { preHandler: authenticate },
    async (request, reply) => {
      const { id: cvId } = cvIdParamSchema.parse(
        request.params,
      );

      const { educationId } =
        educationIdParamSchema.parse(request.params);

      /**
       * Partial schema allows updating only the fields
       * that the client wants to change.
       */
      const input = educationSchema
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

      const education = await educationService.update(
        user.sub,
        cvId,
        educationId,
        input,
      );

      return reply.status(200).send({
        status: "success",
        message: "Education updated successfully",
        education,
      });
    },
  );

  /**
   * DELETE /cvs/:id/education/:educationId
   *
   * Delete one education record.
   */
  app.delete(
    "/cvs/:id/education/:educationId",
    { preHandler: authenticate },
    async (request, reply) => {
      const { id: cvId } = cvIdParamSchema.parse(
        request.params,
      );

      const { educationId } =
        educationIdParamSchema.parse(request.params);

      const user = request.user as {
        sub: string;
      };

      await educationService.delete(
        user.sub,
        cvId,
        educationId,
      );

      return reply.status(200).send({
        status: "success",
        message: "Education deleted successfully",
        cvId,
        educationId,
      });
    },
  );
}
import type { FastifyInstance } from "fastify";

import { authenticate } from "../../middleware/authenticate.js";
import { cvIdParamSchema } from "../../validation/cv/cv.schema.js";
import {
  certificationIdParamSchema,
  certificationSchema,
} from "../../validation/cv/certification.schema.js";
import { certificationService } from "../../services/cvs/certification.service.js";

/**
 * Certification routes.
 *
 * All routes require authentication.
 * CV ownership is verified inside the service layer.
 */
export async function certificationRoutes(
  app: FastifyInstance,
) {
  /**
   * GET /cvs/:id/certifications
   *
   * Get all certifications for a CV.
   */
  app.get(
    "/cvs/:id/certifications",
    { preHandler: authenticate },
    async (request, reply) => {
      const { id: cvId } =
        cvIdParamSchema.parse(request.params);

      const user = request.user as {
        sub: string;
      };

      const certifications =
        await certificationService.getAll(
          user.sub,
          cvId,
        );

      return reply.status(200).send({
        status: "success",
        certifications,
      });
    },
  );

  /**
   * GET /cvs/:id/certifications/:certificationId
   *
   * Get one certification.
   */
  app.get(
    "/cvs/:id/certifications/:certificationId",
    { preHandler: authenticate },
    async (request, reply) => {
      const { id: cvId } =
        cvIdParamSchema.parse(request.params);

      const { certificationId } =
        certificationIdParamSchema.parse(
          request.params,
        );

      const user = request.user as {
        sub: string;
      };

      const certification =
        await certificationService.getById(
          user.sub,
          cvId,
          certificationId,
        );

      return reply.status(200).send({
        status: "success",
        certification,
      });
    },
  );

  /**
   * POST /cvs/:id/certifications
   *
   * Create a certification.
   */
  app.post(
    "/cvs/:id/certifications",
    { preHandler: authenticate },
    async (request, reply) => {
      const { id: cvId } =
        cvIdParamSchema.parse(request.params);

      const input = certificationSchema.parse(
        request.body,
      );

      const user = request.user as {
        sub: string;
      };

      const certification =
        await certificationService.create(
          user.sub,
          cvId,
          input,
        );

      return reply.status(201).send({
        status: "success",
        message: "Certification added successfully",
        certification,
      });
    },
  );

  /**
   * PATCH /cvs/:id/certifications/:certificationId
   *
   * Update a certification.
   */
  app.patch(
    "/cvs/:id/certifications/:certificationId",
    { preHandler: authenticate },
    async (request, reply) => {
      const { id: cvId } =
        cvIdParamSchema.parse(request.params);

      const { certificationId } =
        certificationIdParamSchema.parse(
          request.params,
        );

      const input = certificationSchema
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

      const certification =
        await certificationService.update(
          user.sub,
          cvId,
          certificationId,
          input,
        );

      return reply.status(200).send({
        status: "success",
        message: "Certification updated successfully",
        certification,
      });
    },
  );

  /**
   * DELETE /cvs/:id/certifications/:certificationId
   *
   * Delete a certification.
   */
  app.delete(
    "/cvs/:id/certifications/:certificationId",
    { preHandler: authenticate },
    async (request, reply) => {
      const { id: cvId } =
        cvIdParamSchema.parse(request.params);

      const { certificationId } =
        certificationIdParamSchema.parse(
          request.params,
        );

      const user = request.user as {
        sub: string;
      };

      await certificationService.delete(
        user.sub,
        cvId,
        certificationId,
      );

      return reply.status(200).send({
        status: "success",
        message: "Certification deleted successfully",
        cvId,
        certificationId,
      });
    },
  );
}

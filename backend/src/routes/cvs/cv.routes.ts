import type { FastifyInstance } from "fastify";

import { authenticate } from "../../middleware/authenticate.js";
import { cvService } from "../../services/cvs/cv.service.js";

import {
  createCVSchema,
  updateCVSchema,
  cvIdParamSchema,
} from "../../validation/cv/cv.schema.js";

/**
 * CV CRUD routes.
 *
 * All CV operations require authentication.
 *
 * The authenticated user's ID comes from
 * the verified JWT token, never from the request body.
 */
export async function cvRoutes(app: FastifyInstance) {
  /**
   * Create CV
   *
   * POST /cvs
   */
  app.post(
    "/cvs",
    {
      preHandler: authenticate,
    },
    async (request, reply) => {
      const input = createCVSchema.parse(request.body);

      const { sub: userId } = request.user as {
        sub: string;
        role: string;
      };

      const cv = await cvService.createCV(
        userId,
        input,
      );

      return reply.status(201).send({
        status: "success",
        message: "CV created successfully",
        cv,
      });
    },
  );

  /**
   * Get all CVs belonging to current user.
   *
   * GET /cvs
   */
  app.get(
    "/cvs",
    {
      preHandler: authenticate,
    },
    async (request, reply) => {
      const { sub: userId } = request.user as {
        sub: string;
        role: string;
      };

      const cvs = await cvService.getUserCVs(userId);

      return reply.status(200).send({
        status: "success",
        count: cvs.length,
        cvs,
      });
    },
  );

  /**
   * Get one CV.
   *
   * GET /cvs/:id
   */
  app.get(
    "/cvs/:id",
    {
      preHandler: authenticate,
    },
    async (request, reply) => {
      const { id } = cvIdParamSchema.parse(request.params);

      const { sub: userId } = request.user as {
        sub: string;
        role: string;
      };

      const cv = await cvService.getCVById(
        userId,
        id,
      );

      return reply.status(200).send({
        status: "success",
        cv,
      });
    },
  );

  /**
   * Update CV.
   *
   * PATCH /cvs/:id
   */
  app.patch(
    "/cvs/:id",
    {
      preHandler: authenticate,
    },
    async (request, reply) => {
      const { id } = cvIdParamSchema.parse(request.params);
      const input = updateCVSchema.parse(request.body);

      const { sub: userId } = request.user as {
        sub: string;
        role: string;
      };

      const cv = await cvService.updateCV(
        userId,
        id,
        input,
      );

      return reply.status(200).send({
        status: "success",
        message: "CV updated successfully",
        cv,
      });
    },
  );

  /**
   * Delete CV.
   *
   * DELETE /cvs/:id
   */
  app.delete(
    "/cvs/:id",
    {
      preHandler: authenticate,
    },
    async (request, reply) => {
      const { id } = cvIdParamSchema.parse(request.params);

      const { sub: userId } = request.user as {
        sub: string;
        role: string;
      };

      const result = await cvService.deleteCV(
        userId,
        id,
      );

      return reply.status(200).send({
        status: "success",
        message: "CV deleted successfully",
        ...result,
      });
    },
  );
}
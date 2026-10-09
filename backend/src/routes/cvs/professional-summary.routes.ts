import type { FastifyInstance } from "fastify";

import { authenticate } from "../../middleware/authenticate.js";
import { professionalSummaryService } from "../../services/cvs/professional-summary.service.js";

import { cvIdParamSchema } from "../../validation/cv/cv.schema.js";
import { professionalSummarySchema } from "../../validation/cv/professional-summary.schema.js";

/**
 * Professional Summary routes.
 *
 * All operations require authentication.
 *
 * CV ownership is verified inside the service layer.
 */
export async function professionalSummaryRoutes(
  app: FastifyInstance,
) {
  /**
   * Get Professional Summary.
   *
   * GET /cvs/:id/professional-summary
   */
  app.get(
    "/cvs/:id/professional-summary",
    {
      preHandler: authenticate,
    },
    async (request, reply) => {
      const { id } = cvIdParamSchema.parse(
        request.params,
      );

      const { sub: userId } = request.user as {
        sub: string;
        role: string;
      };

      const professionalSummary =
        await professionalSummaryService.get(
          userId,
          id,
        );

      return reply.status(200).send({
        status: "success",
        professionalSummary,
      });
    },
  );

  /**
   * Create or update Professional Summary.
   *
   * PUT /cvs/:id/professional-summary
   */
  app.put(
    "/cvs/:id/professional-summary",
    {
      preHandler: authenticate,
    },
    async (request, reply) => {
      const { id } = cvIdParamSchema.parse(
        request.params,
      );

      const input =
        professionalSummarySchema.parse(
          request.body,
        );

      const { sub: userId } = request.user as {
        sub: string;
        role: string;
      };

      const professionalSummary =
        await professionalSummaryService.save(
          userId,
          id,
          input,
        );

      return reply.status(200).send({
        status: "success",
        message:
          "Professional summary saved successfully",
        professionalSummary,
      });
    },
  );

  /**
   * Delete Professional Summary.
   *
   * DELETE /cvs/:id/professional-summary
   */
  app.delete(
    "/cvs/:id/professional-summary",
    {
      preHandler: authenticate,
    },
    async (request, reply) => {
      const { id } = cvIdParamSchema.parse(
        request.params,
      );

      const { sub: userId } = request.user as {
        sub: string;
        role: string;
      };

      const result =
        await professionalSummaryService.delete(
          userId,
          id,
        );

      return reply.status(200).send({
        status: "success",
        message:
          "Professional summary deleted successfully",
        ...result,
      });
    },
  );
}
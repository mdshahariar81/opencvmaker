import type { FastifyInstance } from "fastify";

import { authenticate } from "../../middleware/authenticate.js";
import { cvService } from "../../services/cvs/cv.service.js";

import { cvIdParamSchema } from "../../validation/cv/cv.schema.js";
import { updateCVStatusSchema } from "../../validation/cv/cv-status.schema.js";

/**
 * CV Status Routes
 *
 * Handles:
 * - Updating CV status
 * - Publishing a CV
 * - Returning a published CV to draft
 * - Archiving a CV
 */
export async function cvStatusRoutes(app: FastifyInstance) {
  /**
   * Update CV status.
   *
   * PATCH /cvs/:id/status
   *
   * Body:
   * {
   *   "status": "PUBLISHED"
   * }
   */
  app.patch(
    "/cvs/:id/status",
    {
      preHandler: authenticate,
    },
    async (request, reply) => {
      const { id: cvId } = cvIdParamSchema.parse(request.params);

      const { status } = updateCVStatusSchema.parse(request.body);

      const { sub: userId } = request.user as {
        sub: string;
        role: string;
      };

      const cv = await cvService.updateStatus(
        userId,
        cvId,
        status,
      );

      return reply.status(200).send({
        status: "success",
        message: "CV status updated successfully",
        cv,
      });
    },
  );
}
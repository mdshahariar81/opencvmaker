import type { FastifyInstance } from "fastify";

import { authenticate } from "../../middleware/authenticate.js";
import { cvService } from "../../services/cvs/cv.service.js";

import { cvIdParamSchema } from "../../validation/cv/cv.schema.js";

export async function cvFullRoutes(app: FastifyInstance) {
  /**
   * Get the complete CV with all CV sections.
   *
   * Authentication ensures users can only access
   * their own CV data.
   */
  app.get(
    "/cvs/:id/full",
    { preHandler: authenticate },
    async (request, reply) => {
      const { id } = cvIdParamSchema.parse(request.params);

      const { sub: userId } = request.user as {
        sub: string;
        role: string;
      };

      const cv = await cvService.getFullCV(userId, id);

      return reply.status(200).send({
        status: "success",
        cv,
      });
    },
  );
}

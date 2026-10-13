import type { FastifyInstance } from "fastify";

import { authenticate } from "../../middleware/authenticate.js";
import { cvPublicService } from "../../services/cvs/cv-public.service.js";

import { cvIdParamSchema } from "../../validation/cv/cv.schema.js";
import {
  publicCVSlugSchema,
  updateCVPublicSchema,
} from "../../validation/cv/cv-public.schema.js";

/**
 * CV Public / Sharing Routes
 *
 * Handles:
 * - Enabling/disabling public access
 * - Setting a public CV slug
 * - Reading a public CV without authentication
 */
export async function cvPublicRoutes(app: FastifyInstance) {
  /**
   * Update public CV settings.
   *
   * PATCH /cvs/:id/public
   *
   * Example:
   * {
   *   "isPublic": true,
   *   "slug": "shahariar-hossen"
   * }
   */
  app.patch(
    "/cvs/:id/public",
    {
      preHandler: authenticate,
    },
    async (request, reply) => {
      const { id: cvId } = cvIdParamSchema.parse(request.params);

      const { isPublic, slug } = updateCVPublicSchema.parse(
        request.body,
      );

      const { sub: userId } = request.user as {
        sub: string;
        role: string;
      };

      const cv = await cvPublicService.updatePublicSettings(
        userId,
        cvId,
        isPublic,
        slug,
      );

      return reply.status(200).send({
        status: "success",
        message: isPublic
          ? "CV made public successfully"
          : "CV made private successfully",
        cv,
      });
    },
  );

  /**
   * Get a public CV by slug.
   *
   * GET /public/cv/:slug
   *
   * Authentication is intentionally NOT required.
   */
  app.get(
    "/public/cv/:slug",
    async (request, reply) => {
      const { slug } = publicCVSlugSchema.parse(
        request.params,
      );

      const cv = await cvPublicService.getPublicCV(slug);

      return reply.status(200).send({
        status: "success",
        cv,
      });
    },
  );
}
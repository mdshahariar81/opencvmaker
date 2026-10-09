import type { FastifyInstance } from "fastify";

import { authenticate } from "../../middleware/authenticate.js";
import { personalInformationService } from "../../services/cvs/personal-information.service.js";

import { cvIdParamSchema } from "../../validation/cv/cv.schema.js";
import { personalInformationSchema } from "../../validation/cv/personal-information.schema.js";

/**
 * Personal Information routes.
 *
 * All operations require authentication and
 * are protected by CV ownership checks in the service.
 */
export async function personalInformationRoutes(
  app: FastifyInstance,
) {
  /**
   * Get Personal Information
   *
   * GET /cvs/:id/personal-information
   */
  app.get(
    "/cvs/:id/personal-information",
    {
      preHandler: authenticate,
    },
    async (request, reply) => {
      const { id } = cvIdParamSchema.parse(request.params);

      const { sub: userId } = request.user as {
        sub: string;
        role: string;
      };

      const personalInformation =
        await personalInformationService.get(
          userId,
          id,
        );

      return reply.status(200).send({
        status: "success",
        personalInformation,
      });
    },
  );

  /**
   * Create or update Personal Information.
   *
   * PUT /cvs/:id/personal-information
   */
  app.put(
    "/cvs/:id/personal-information",
    {
      preHandler: authenticate,
    },
    async (request, reply) => {
      const { id } = cvIdParamSchema.parse(request.params);

      const input = personalInformationSchema.parse(
        request.body,
      );

      const { sub: userId } = request.user as {
        sub: string;
        role: string;
      };

      const personalInformation =
        await personalInformationService.save(
          userId,
          id,
          input,
        );

      return reply.status(200).send({
        status: "success",
        message: "Personal information saved successfully",
        personalInformation,
      });
    },
  );

  /**
   * Delete Personal Information.
   *
   * DELETE /cvs/:id/personal-information
   */
  app.delete(
    "/cvs/:id/personal-information",
    {
      preHandler: authenticate,
    },
    async (request, reply) => {
      const { id } = cvIdParamSchema.parse(request.params);

      const { sub: userId } = request.user as {
        sub: string;
        role: string;
      };

      const result =
        await personalInformationService.delete(
          userId,
          id,
        );

      return reply.status(200).send({
        status: "success",
        message: "Personal information deleted successfully",
        ...result,
      });
    },
  );
}
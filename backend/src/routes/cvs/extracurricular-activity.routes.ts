import type { FastifyInstance } from "fastify";

import { authenticate } from "../../middleware/authenticate.js";
import { extracurricularActivityService } from "../../services/cvs/extracurricular-activity.service.js";

import { cvIdParamSchema } from "../../validation/cv/cv.schema.js";

import {
  extracurricularActivityIdParamSchema,
  extracurricularActivitySchema,
} from "../../validation/cv/extracurricular-activity.schema.js";

/**
 * Extracurricular Activity routes.
 *
 * Provides CRUD endpoints for activities such as
 * student clubs, sports, cultural activities, and
 * other extracurricular involvement.
 */
export async function extracurricularActivityRoutes(
  app: FastifyInstance,
) {
  /**
   * Get all extracurricular activities for a CV.
   */
  app.get(
    "/cvs/:id/extracurricular-activities",
    { preHandler: authenticate },
    async (request, reply) => {
      const { id: cvId } =
        cvIdParamSchema.parse(request.params);

      const user = request.user as { sub: string };

      const activities =
        await extracurricularActivityService.getAll(
          user.sub,
          cvId,
        );

      return reply.status(200).send({
        status: "success",
        extracurricularActivities: activities,
      });
    },
  );

  /**
   * Get one extracurricular activity.
   */
  app.get(
    "/cvs/:id/extracurricular-activities/:extracurricularActivityId",
    { preHandler: authenticate },
    async (request, reply) => {
      const { id: cvId } =
        cvIdParamSchema.parse(request.params);

      const { extracurricularActivityId } =
        extracurricularActivityIdParamSchema.parse(
          request.params,
        );

      const user = request.user as { sub: string };

      const activity =
        await extracurricularActivityService.getById(
          user.sub,
          cvId,
          extracurricularActivityId,
        );

      return reply.status(200).send({
        status: "success",
        extracurricularActivity: activity,
      });
    },
  );

  /**
   * Create a new extracurricular activity.
   */
  app.post(
    "/cvs/:id/extracurricular-activities",
    { preHandler: authenticate },
    async (request, reply) => {
      const { id: cvId } =
        cvIdParamSchema.parse(request.params);

      const input =
        extracurricularActivitySchema.parse(
          request.body,
        );

      const user = request.user as { sub: string };

      const activity =
        await extracurricularActivityService.create(
          user.sub,
          cvId,
          input,
        );

      return reply.status(201).send({
        status: "success",
        message:
          "Extracurricular activity added successfully",
        extracurricularActivity: activity,
      });
    },
  );

  /**
   * Update an existing extracurricular activity.
   */
  app.patch(
    "/cvs/:id/extracurricular-activities/:extracurricularActivityId",
    { preHandler: authenticate },
    async (request, reply) => {
      const { id: cvId } =
        cvIdParamSchema.parse(request.params);

      const { extracurricularActivityId } =
        extracurricularActivityIdParamSchema.parse(
          request.params,
        );

      const input =
        extracurricularActivitySchema
          .partial()
          .refine(
            (data) => Object.keys(data).length > 0,
            {
              message:
                "At least one field is required for update",
            },
          )
          .parse(request.body);

      const user = request.user as { sub: string };

      const activity =
        await extracurricularActivityService.update(
          user.sub,
          cvId,
          extracurricularActivityId,
          input,
        );

      return reply.status(200).send({
        status: "success",
        message:
          "Extracurricular activity updated successfully",
        extracurricularActivity: activity,
      });
    },
  );

  /**
   * Delete an extracurricular activity.
   */
  app.delete(
    "/cvs/:id/extracurricular-activities/:extracurricularActivityId",
    { preHandler: authenticate },
    async (request, reply) => {
      const { id: cvId } =
        cvIdParamSchema.parse(request.params);

      const { extracurricularActivityId } =
        extracurricularActivityIdParamSchema.parse(
          request.params,
        );

      const user = request.user as { sub: string };

      const result =
        await extracurricularActivityService.delete(
          user.sub,
          cvId,
          extracurricularActivityId,
        );

      return reply.status(200).send({
        status: "success",
        message:
          "Extracurricular activity deleted successfully",
        ...result,
      });
    },
  );
}

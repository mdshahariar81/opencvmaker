import type { FastifyInstance } from "fastify";

import { authenticate } from "../../middleware/authenticate.js";
import { patentService } from "../../services/cvs/patent.service.js";

import { cvIdParamSchema } from "../../validation/cv/cv.schema.js";

import {
  patentIdParamSchema,
  patentSchema,
} from "../../validation/cv/patent.schema.js";

/**
 * Patent routes.
 *
 * Provides CRUD endpoints for patents listed on a CV.
 */
export async function patentRoutes(
  app: FastifyInstance,
) {
  /**
   * Get all patents for a CV.
   */
  app.get(
    "/cvs/:id/patents",
    { preHandler: authenticate },
    async (request, reply) => {
      const { id: cvId } =
        cvIdParamSchema.parse(request.params);

      const user = request.user as { sub: string };

      const patents = await patentService.getAll(
        user.sub,
        cvId,
      );

      return reply.status(200).send({
        status: "success",
        patents,
      });
    },
  );

  /**
   * Get one patent.
   */
  app.get(
    "/cvs/:id/patents/:patentId",
    { preHandler: authenticate },
    async (request, reply) => {
      const { id: cvId } =
        cvIdParamSchema.parse(request.params);

      const { patentId } =
        patentIdParamSchema.parse(request.params);

      const user = request.user as { sub: string };

      const patent = await patentService.getById(
        user.sub,
        cvId,
        patentId,
      );

      return reply.status(200).send({
        status: "success",
        patent,
      });
    },
  );

  /**
   * Create a new patent.
   */
  app.post(
    "/cvs/:id/patents",
    { preHandler: authenticate },
    async (request, reply) => {
      const { id: cvId } =
        cvIdParamSchema.parse(request.params);

      const input = patentSchema.parse(request.body);

      const user = request.user as { sub: string };

      const patent = await patentService.create(
        user.sub,
        cvId,
        input,
      );

      return reply.status(201).send({
        status: "success",
        message: "Patent added successfully",
        patent,
      });
    },
  );

  /**
   * Update an existing patent.
   */
  app.patch(
    "/cvs/:id/patents/:patentId",
    { preHandler: authenticate },
    async (request, reply) => {
      const { id: cvId } =
        cvIdParamSchema.parse(request.params);

      const { patentId } =
        patentIdParamSchema.parse(request.params);

      const input = patentSchema
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

      const patent = await patentService.update(
        user.sub,
        cvId,
        patentId,
        input,
      );

      return reply.status(200).send({
        status: "success",
        message: "Patent updated successfully",
        patent,
      });
    },
  );

  /**
   * Delete a patent.
   */
  app.delete(
    "/cvs/:id/patents/:patentId",
    { preHandler: authenticate },
    async (request, reply) => {
      const { id: cvId } =
        cvIdParamSchema.parse(request.params);

      const { patentId } =
        patentIdParamSchema.parse(request.params);

      const user = request.user as { sub: string };

      const result = await patentService.delete(
        user.sub,
        cvId,
        patentId,
      );

      return reply.status(200).send({
        status: "success",
        message: "Patent deleted successfully",
        ...result,
      });
    },
  );
}

import type { FastifyInstance } from "fastify";

import { authenticate } from "../../middleware/authenticate.js";
import { cvVersionService } from "../../services/cvs/cv-version.service.js";

import { cvIdParamSchema } from "../../validation/cv/cv.schema.js";
import { cvVersionParamSchema } from "../../validation/cv/cv-version.schema.js";

/**
 * CV Version Routes
 *
 * Handles:
 * - Creating a CV snapshot
 * - Listing CV versions
 * - Reading a specific CV version
 * - Restoring a previous CV version
 */
export async function cvVersionRoutes(app: FastifyInstance) {
  /**
   * Create a new CV version snapshot.
   *
   * POST /cvs/:id/versions
   */
  app.post(
    "/cvs/:id/versions",
    { preHandler: authenticate },
    async (request, reply) => {
      const { id: cvId } = cvIdParamSchema.parse(
        request.params,
      );

      const { sub: userId } = request.user as {
        sub: string;
        role: string;
      };

      const version = await cvVersionService.createVersion(
        userId,
        cvId,
      );

      return reply.status(201).send({
        status: "success",
        message: "CV version created successfully",
        version,
      });
    },
  );

  /**
   * Get all versions for a CV.
   *
   * GET /cvs/:id/versions
   */
  app.get(
    "/cvs/:id/versions",
    { preHandler: authenticate },
    async (request, reply) => {
      const { id: cvId } = cvIdParamSchema.parse(
        request.params,
      );

      const { sub: userId } = request.user as {
        sub: string;
        role: string;
      };

      const versions = await cvVersionService.getVersions(
        userId,
        cvId,
      );

      return reply.status(200).send({
        status: "success",
        versions,
      });
    },
  );

  /**
   * Get one specific CV version.
   *
   * GET /cvs/:id/versions/:version
   */
  app.get(
    "/cvs/:id/versions/:version",
    { preHandler: authenticate },
    async (request, reply) => {
      const { id: cvId } = cvIdParamSchema.parse(
        request.params,
      );

      const { version: versionNumber } =
        cvVersionParamSchema.parse(request.params);

      const { sub: userId } = request.user as {
        sub: string;
        role: string;
      };

      const version = await cvVersionService.getVersion(
        userId,
        cvId,
        versionNumber,
      );

      return reply.status(200).send({
        status: "success",
        version,
      });
    },
  );

  /**
   * Restore a previous CV version.
   *
   * POST /cvs/:id/versions/:version/restore
   *
   * The selected version remains unchanged.
   * Restoring creates a new version containing
   * the restored data.
   */
  app.post(
    "/cvs/:id/versions/:version/restore",
    { preHandler: authenticate },
    async (request, reply) => {
      const { id: cvId } = cvIdParamSchema.parse(
        request.params,
      );

      const { version: versionNumber } =
        cvVersionParamSchema.parse(request.params);

      const { sub: userId } = request.user as {
        sub: string;
        role: string;
      };

      const result = await cvVersionService.restoreVersion(
        userId,
        cvId,
        versionNumber,
      );

      return reply.status(200).send({
        status: "success",
        message: "CV version restored successfully",
        ...result,
      });
    },
  );
}
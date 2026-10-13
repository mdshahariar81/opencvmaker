import type { FastifyInstance } from "fastify";

import { authenticate } from "../../middleware/authenticate.js";
import { cvExportService } from "../../services/cvs/cv-export.service.js";
import {
  createCVExportSchema,
  cvExportIdParamSchema,
} from "../../validation/cv/cv-export.schema.js";
import { cvIdParamSchema } from "../../validation/cv/cv.schema.js";

/**
 * CV Export Routes
 *
 * Handles CV export creation, listing, downloading,
 * viewing, and deletion.
 */
export async function cvExportRoutes(app: FastifyInstance) {
  /**
   * Create a CV export.
   *
   * POST /cvs/:id/exports
   */
  app.post(
    "/cvs/:id/exports",
    { preHandler: authenticate },
    async (request, reply) => {
      const { id: cvId } = cvIdParamSchema.parse(request.params);

      const input = createCVExportSchema.parse(request.body);

      const { sub: userId } = request.user as {
        sub: string;
        role: string;
      };

      const exportRecord = await cvExportService.createExport(
        userId,
        cvId,
        input,
      );

      return reply.status(201).send({
        status: "success",
        message: "CV export created successfully",
        export: exportRecord,
      });
    },
  );

  /**
   * Get all exports for a CV.
   *
   * GET /cvs/:id/exports
   */
  app.get(
    "/cvs/:id/exports",
    { preHandler: authenticate },
    async (request, reply) => {
      const { id: cvId } = cvIdParamSchema.parse(request.params);

      const { sub: userId } = request.user as {
        sub: string;
        role: string;
      };

      const exports = await cvExportService.getExports(
        userId,
        cvId,
      );

      return reply.status(200).send({
        status: "success",
        exports,
      });
    },
  );

  /**
   * Download a generated CV export.
   *
   * GET /cvs/:id/exports/:exportId/download
   */
  app.get(
    "/cvs/:id/exports/:exportId/download",
    { preHandler: authenticate },
    async (request, reply) => {
      const { id: cvId } = cvIdParamSchema.parse(request.params);

      const { exportId } = cvExportIdParamSchema.parse(
        request.params,
      );

      const { sub: userId } = request.user as {
        sub: string;
        role: string;
      };

      const {
        exportRecord,
        fileBuffer,
        fileName,
      } = await cvExportService.downloadExport(
        userId,
        cvId,
        exportId,
      );

      if (exportRecord.format === "PDF") {
        reply.header(
          "Content-Type",
          "application/pdf",
        );
      }

      reply.header(
        "Content-Disposition",
        `attachment; filename="${fileName}"`,
      );

      reply.header(
        "Content-Length",
        fileBuffer.length,
      );

      return reply.send(fileBuffer);
    },
  );

  /**
   * Get one CV export.
   *
   * GET /cvs/:id/exports/:exportId
   */
  app.get(
    "/cvs/:id/exports/:exportId",
    { preHandler: authenticate },
    async (request, reply) => {
      const { id: cvId } = cvIdParamSchema.parse(request.params);

      const { exportId } = cvExportIdParamSchema.parse(
        request.params,
      );

      const { sub: userId } = request.user as {
        sub: string;
        role: string;
      };

      const exportRecord = await cvExportService.getExport(
        userId,
        cvId,
        exportId,
      );

      return reply.status(200).send({
        status: "success",
        export: exportRecord,
      });
    },
  );

  /**
   * Delete one CV export.
   *
   * DELETE /cvs/:id/exports/:exportId
   */
  app.delete(
    "/cvs/:id/exports/:exportId",
    { preHandler: authenticate },
    async (request, reply) => {
      const { id: cvId } = cvIdParamSchema.parse(request.params);

      const { exportId } = cvExportIdParamSchema.parse(
        request.params,
      );

      const { sub: userId } = request.user as {
        sub: string;
        role: string;
      };

      const result = await cvExportService.deleteExport(
        userId,
        cvId,
        exportId,
      );

      return reply.status(200).send({
        status: "success",
        message: "CV export deleted successfully",
        ...result,
      });
    },
  );
}
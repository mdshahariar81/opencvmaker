import type { FastifyPluginAsync } from "fastify";
import { authenticate } from "../../middleware/authenticate.js";
import { customSectionService } from "../../services/cvs/custom-section.service.js";
import {
  customSectionIdParamSchema,
  customSectionSchema,
} from "../../validation/cv/custom-section.schema.js";

type AuthenticatedUser = {
  id: string;
};

function getUserId(request: { user: unknown }): string {
  return (request.user as AuthenticatedUser).id;
}

export const customSectionRoutes: FastifyPluginAsync = async (app) => {
  app.addHook("preHandler", authenticate);

  // GET /cvs/:id/custom-sections
  app.get("/cvs/:id/custom-sections", async (request) => {
    const { id } = request.params as { id: string };

    const customSections = await customSectionService.getAll(
      getUserId(request),
      id,
    );

    return {
      status: "success",
      customSections,
    };
  });

  // GET /cvs/:id/custom-sections/:customSectionId
  app.get(
    "/cvs/:id/custom-sections/:customSectionId",
    async (request) => {
      const { id, customSectionId } = request.params as {
        id: string;
        customSectionId: string;
      };

      const params = customSectionIdParamSchema.parse({
        customSectionId,
      });

      const customSection = await customSectionService.getById(
        getUserId(request),
        id,
        params.customSectionId,
      );

      return {
        status: "success",
        customSection,
      };
    },
  );

  // POST /cvs/:id/custom-sections
  app.post("/cvs/:id/custom-sections", async (request, reply) => {
    const { id } = request.params as { id: string };

    const input = customSectionSchema.parse(request.body);

    const customSection = await customSectionService.create(
      getUserId(request),
      id,
      input,
    );

    return reply.status(201).send({
      status: "success",
      customSection,
    });
  });

  // PATCH /cvs/:id/custom-sections/:customSectionId
  app.patch(
    "/cvs/:id/custom-sections/:customSectionId",
    async (request) => {
      const { id, customSectionId } = request.params as {
        id: string;
        customSectionId: string;
      };

      const params = customSectionIdParamSchema.parse({
        customSectionId,
      });

      const input = customSectionSchema.partial().parse(request.body);

      const customSection = await customSectionService.update(
        getUserId(request),
        id,
        params.customSectionId,
        input,
      );

      return {
        status: "success",
        customSection,
      };
    },
  );

  // DELETE /cvs/:id/custom-sections/:customSectionId
  app.delete(
    "/cvs/:id/custom-sections/:customSectionId",
    async (request) => {
      const { id, customSectionId } = request.params as {
        id: string;
        customSectionId: string;
      };

      const params = customSectionIdParamSchema.parse({
        customSectionId,
      });

      const result = await customSectionService.delete(
        getUserId(request),
        id,
        params.customSectionId,
      );

      return {
        status: "success",
        ...result,
      };
    },
  );
};

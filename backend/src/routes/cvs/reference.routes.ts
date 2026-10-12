import type { FastifyPluginAsync } from "fastify";
import { authenticate } from "../../middleware/authenticate.js";
import { referenceService } from "../../services/cvs/reference.service.js";
import {
  referenceIdParamSchema,
  referenceSchema,
} from "../../validation/cv/reference.schema.js";

type AuthenticatedUser = {
  id: string;
};

function getUserId(request: { user: unknown }): string {
  return (request.user as AuthenticatedUser).id;
}

export const referenceRoutes: FastifyPluginAsync = async (app) => {
  app.addHook("preHandler", authenticate);

  // GET /cvs/:id/references
  app.get("/cvs/:id/references", async (request) => {
    const { id } = request.params as { id: string };

    const references = await referenceService.getAll(
      getUserId(request),
      id,
    );

    return {
      status: "success",
      references,
    };
  });

  // GET /cvs/:id/references/:referenceId
  app.get("/cvs/:id/references/:referenceId", async (request) => {
    const { id, referenceId } = request.params as {
      id: string;
      referenceId: string;
    };

    const params = referenceIdParamSchema.parse({ referenceId });

    const reference = await referenceService.getById(
      getUserId(request),
      id,
      params.referenceId,
    );

    return {
      status: "success",
      reference,
    };
  });

  // POST /cvs/:id/references
  app.post("/cvs/:id/references", async (request, reply) => {
    const { id } = request.params as { id: string };

    const input = referenceSchema.parse(request.body);

    const reference = await referenceService.create(
      getUserId(request),
      id,
      input,
    );

    return reply.status(201).send({
      status: "success",
      reference,
    });
  });

  // PATCH /cvs/:id/references/:referenceId
  app.patch(
    "/cvs/:id/references/:referenceId",
    async (request) => {
      const { id, referenceId } = request.params as {
        id: string;
        referenceId: string;
      };

      const params = referenceIdParamSchema.parse({ referenceId });

      const input = referenceSchema.partial().parse(request.body);

      const reference = await referenceService.update(
        getUserId(request),
        id,
        params.referenceId,
        input,
      );

      return {
        status: "success",
        reference,
      };
    },
  );

  // DELETE /cvs/:id/references/:referenceId
  app.delete(
    "/cvs/:id/references/:referenceId",
    async (request) => {
      const { id, referenceId } = request.params as {
        id: string;
        referenceId: string;
      };

      const params = referenceIdParamSchema.parse({ referenceId });

      const result = await referenceService.delete(
        getUserId(request),
        id,
        params.referenceId,
      );

      return {
        status: "success",
        ...result,
      };
    },
  );
};

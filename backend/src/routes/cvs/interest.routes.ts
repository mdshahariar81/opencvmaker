import type { FastifyPluginAsync } from "fastify";
import { authenticate } from "../../middleware/authenticate.js";
import { interestService } from "../../services/cvs/interest.service.js";
import {
  interestIdParamSchema,
  interestSchema,
} from "../../validation/cv/interest.schema.js";


type AuthenticatedUser = {
  id: string;
};

function getUserId(request: { user: unknown }): string {
  return (request.user as AuthenticatedUser).id;
}

export const interestRoutes: FastifyPluginAsync = async (app) => {
  app.addHook("preHandler", authenticate);
  // Get all interests for a CV.
  app.get("/cvs/:id/interests", async (request, reply) => {
    const { id: cvId } = request.params as { id: string };

    const interests = await interestService.getAll(
      getUserId(request),
      cvId,
    );

    return reply.send({
      status: "success",
      interests,
    });
  });

  // Get one interest by ID.
  app.get(
    "/cvs/:id/interests/:interestId",
    async (request, reply) => {
      const { id: cvId } = request.params as { id: string };

      const { interestId } = interestIdParamSchema.parse(
        request.params,
      );

      const interest = await interestService.getById(
        getUserId(request),
        cvId,
        interestId,
      );

      return reply.send({
        status: "success",
        interest,
      });
    },
  );

  // Create a new interest.
  app.post("/cvs/:id/interests", async (request, reply) => {
    const { id: cvId } = request.params as { id: string };

    const input = interestSchema.parse(request.body);

    const interest = await interestService.create(
      getUserId(request),
      cvId,
      input,
    );

    return reply.code(201).send({
      status: "success",
      message: "Interest added successfully",
      interest,
    });
  });

  // Update an existing interest.
  app.patch(
    "/cvs/:id/interests/:interestId",
    async (request, reply) => {
      const { id: cvId } = request.params as { id: string };

      const { interestId } = interestIdParamSchema.parse(
        request.params,
      );

      const input = interestSchema.partial().parse(request.body);

      const interest = await interestService.update(
        getUserId(request),
        cvId,
        interestId,
        input,
      );

      return reply.send({
        status: "success",
        message: "Interest updated successfully",
        interest,
      });
    },
  );

  // Delete an interest.
  app.delete(
    "/cvs/:id/interests/:interestId",
    async (request, reply) => {
      const { id: cvId } = request.params as { id: string };

      const { interestId } = interestIdParamSchema.parse(
        request.params,
      );

      const result = await interestService.delete(
        getUserId(request),
        cvId,
        interestId,
      );

      return reply.send({
        status: "success",
        message: "Interest deleted successfully",
        ...result,
      });
    },
  );
};

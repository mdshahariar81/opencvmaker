import type { FastifyInstance } from "fastify";

import { authenticate } from "../../middleware/authenticate.js";
import { membershipService } from "../../services/cvs/membership.service.js";

import { cvIdParamSchema } from "../../validation/cv/cv.schema.js";
import {
  membershipIdParamSchema,
  membershipSchema,
} from "../../validation/cv/membership.schema.js";

/**
 * Membership / Professional Affiliations routes.
 *
 * All routes require authentication.
 * CV ownership is verified inside the service layer.
 */
export async function membershipRoutes(
  app: FastifyInstance,
) {
  /**
   * Get all memberships for a CV.
   */
  app.get(
    "/cvs/:id/memberships",
    { preHandler: authenticate },
    async (request, reply) => {
      const { id: cvId } =
        cvIdParamSchema.parse(request.params);

      const user = request.user as {
        sub: string;
      };

      const memberships =
        await membershipService.getAll(
          user.sub,
          cvId,
        );

      return reply.status(200).send({
        status: "success",
        memberships,
      });
    },
  );

  /**
   * Get one membership record.
   */
  app.get(
    "/cvs/:id/memberships/:membershipId",
    { preHandler: authenticate },
    async (request, reply) => {
      const { id: cvId } =
        cvIdParamSchema.parse(request.params);

      const { membershipId } =
        membershipIdParamSchema.parse(
          request.params,
        );

      const user = request.user as {
        sub: string;
      };

      const membership =
        await membershipService.getById(
          user.sub,
          cvId,
          membershipId,
        );

      return reply.status(200).send({
        status: "success",
        membership,
      });
    },
  );

  /**
   * Create a membership record.
   */
  app.post(
    "/cvs/:id/memberships",
    { preHandler: authenticate },
    async (request, reply) => {
      const { id: cvId } =
        cvIdParamSchema.parse(request.params);

      const input =
        membershipSchema.parse(request.body);

      const user = request.user as {
        sub: string;
      };

      const membership =
        await membershipService.create(
          user.sub,
          cvId,
          input,
        );

      return reply.status(201).send({
        status: "success",
        message: "Membership added successfully",
        membership,
      });
    },
  );

  /**
   * Update a membership record.
   */
  app.patch(
    "/cvs/:id/memberships/:membershipId",
    { preHandler: authenticate },
    async (request, reply) => {
      const { id: cvId } =
        cvIdParamSchema.parse(request.params);

      const { membershipId } =
        membershipIdParamSchema.parse(
          request.params,
        );

      const input = membershipSchema
        .partial()
        .refine(
          (data) => Object.keys(data).length > 0,
          {
            message:
              "At least one field is required for update",
          },
        )
        .parse(request.body);

      const user = request.user as {
        sub: string;
      };

      const membership =
        await membershipService.update(
          user.sub,
          cvId,
          membershipId,
          input,
        );

      return reply.status(200).send({
        status: "success",
        message: "Membership updated successfully",
        membership,
      });
    },
  );

  /**
   * Delete a membership record.
   */
  app.delete(
    "/cvs/:id/memberships/:membershipId",
    { preHandler: authenticate },
    async (request, reply) => {
      const { id: cvId } =
        cvIdParamSchema.parse(request.params);

      const { membershipId } =
        membershipIdParamSchema.parse(
          request.params,
        );

      const user = request.user as {
        sub: string;
      };

      const result =
        await membershipService.delete(
          user.sub,
          cvId,
          membershipId,
        );

      return reply.status(200).send({
        status: "success",
        message: "Membership deleted successfully",
        ...result,
      });
    },
  );
}
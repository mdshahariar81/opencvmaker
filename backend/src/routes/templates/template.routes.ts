import type { FastifyInstance } from "fastify";

import { templateService } from "../../services/templates/template.service.js";
import { templateIdParamSchema } from "../../validation/templates/template.schema.js";

export async function templateRoutes(app: FastifyInstance) {
  // Get all active templates
  app.get(
    "/templates",
    async (_request, reply) => {
      const templates =
        await templateService.getTemplates();

      return reply.status(200).send({
        status: "success",
        templates,
      });
    },
  );

  // Get one active template
  app.get(
    "/templates/:templateId",
    async (request, reply) => {
      const { templateId } =
        templateIdParamSchema.parse(
          request.params,
        );

      const template =
        await templateService.getTemplate(
          templateId,
        );

      return reply.status(200).send({
        status: "success",
        template,
      });
    },
  );
}
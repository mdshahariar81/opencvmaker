import type { FastifyInstance } from "fastify";

import { authenticate } from "../../middleware/authenticate.js";
import { cvSectionSettingService } from "../../services/cvs/cv-section-setting.service.js";

import {
  cvSectionSettingSchema,
  cvSectionSettingIdParamSchema,
} from "../../validation/cv/cv-section-setting.schema.js";

import { cvIdParamSchema } from "../../validation/cv/cv.schema.js";

export async function cvSectionSettingRoutes(app: FastifyInstance) {
  /**
   * Get all section settings for a CV.
   */
  app.get(
    "/cvs/:id/section-settings",
    { preHandler: authenticate },
    async (request, reply) => {
      const { id: cvId } = cvIdParamSchema.parse(request.params);

      const { sub: userId } = request.user as {
        sub: string;
        role: string;
      };

      const sectionSettings =
        await cvSectionSettingService.getSectionSettings(
          userId,
          cvId,
        );

      return reply.status(200).send({
        status: "success",
        sectionSettings,
      });
    },
  );

  /**
   * Create a section setting.
   */
  app.post(
    "/cvs/:id/section-settings",
    { preHandler: authenticate },
    async (request, reply) => {
      const { id: cvId } = cvIdParamSchema.parse(request.params);
      const input = cvSectionSettingSchema.parse(request.body);

      const { sub: userId } = request.user as {
        sub: string;
        role: string;
      };

      const sectionSetting =
        await cvSectionSettingService.createSectionSetting(
          userId,
          cvId,
          input,
        );

      return reply.status(201).send({
        status: "success",
        message: "Section setting created successfully",
        sectionSetting,
      });
    },
  );

  /**
   * Update a section setting.
   */
  app.patch(
    "/cvs/:id/section-settings/:settingId",
    { preHandler: authenticate },
    async (request, reply) => {
      const { id: cvId } = cvIdParamSchema.parse(request.params);

      const { settingId } =
        cvSectionSettingIdParamSchema.parse(request.params);

      const input = cvSectionSettingSchema.partial().parse(
        request.body,
      );

      const { sub: userId } = request.user as {
        sub: string;
        role: string;
      };

      const sectionSetting =
        await cvSectionSettingService.updateSectionSetting(
          userId,
          cvId,
          settingId,
          input,
        );

      return reply.status(200).send({
        status: "success",
        message: "Section setting updated successfully",
        sectionSetting,
      });
    },
  );

  /**
   * Delete a section setting.
   */
  app.delete(
    "/cvs/:id/section-settings/:settingId",
    { preHandler: authenticate },
    async (request, reply) => {
      const { id: cvId } = cvIdParamSchema.parse(request.params);

      const { settingId } =
        cvSectionSettingIdParamSchema.parse(request.params);

      const { sub: userId } = request.user as {
        sub: string;
        role: string;
      };

      const result =
        await cvSectionSettingService.deleteSectionSetting(
          userId,
          cvId,
          settingId,
        );

      return reply.status(200).send({
        status: "success",
        message: "Section setting deleted successfully",
        ...result,
      });
    },
  );
}

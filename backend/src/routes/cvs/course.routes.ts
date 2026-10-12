import type { FastifyInstance } from "fastify";

import { authenticate } from "../../middleware/authenticate.js";
import { courseService } from "../../services/cvs/course.service.js";

import { cvIdParamSchema } from "../../validation/cv/cv.schema.js";
import {
  courseIdParamSchema,
  courseSchema,
} from "../../validation/cv/course.schema.js";

/**
 * Course / Training routes.
 *
 * All routes require authentication.
 * CV ownership is verified inside the service layer.
 */
export async function courseRoutes(
  app: FastifyInstance,
) {
  /**
   * Get all courses for a CV.
   */
  app.get(
    "/cvs/:id/courses",
    { preHandler: authenticate },
    async (request, reply) => {
      const { id: cvId } =
        cvIdParamSchema.parse(request.params);

      const user = request.user as {
        sub: string;
      };

      const courses =
        await courseService.getAll(
          user.sub,
          cvId,
        );

      return reply.status(200).send({
        status: "success",
        courses,
      });
    },
  );

  /**
   * Get a single course.
   */
  app.get(
    "/cvs/:id/courses/:courseId",
    { preHandler: authenticate },
    async (request, reply) => {
      const { id: cvId } =
        cvIdParamSchema.parse(request.params);

      const { courseId } =
        courseIdParamSchema.parse(
          request.params,
        );

      const user = request.user as {
        sub: string;
      };

      const course =
        await courseService.getById(
          user.sub,
          cvId,
          courseId,
        );

      return reply.status(200).send({
        status: "success",
        course,
      });
    },
  );

  /**
   * Create a course.
   */
  app.post(
    "/cvs/:id/courses",
    { preHandler: authenticate },
    async (request, reply) => {
      const { id: cvId } =
        cvIdParamSchema.parse(request.params);

      const input =
        courseSchema.parse(request.body);

      const user = request.user as {
        sub: string;
      };

      const course =
        await courseService.create(
          user.sub,
          cvId,
          input,
        );

      return reply.status(201).send({
        status: "success",
        message:
          "Course added successfully",
        course,
      });
    },
  );

  /**
   * Update a course.
   */
  app.patch(
    "/cvs/:id/courses/:courseId",
    { preHandler: authenticate },
    async (request, reply) => {
      const { id: cvId } =
        cvIdParamSchema.parse(request.params);

      const { courseId } =
        courseIdParamSchema.parse(
          request.params,
        );

      const input = courseSchema
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

      const course =
        await courseService.update(
          user.sub,
          cvId,
          courseId,
          input,
        );

      return reply.status(200).send({
        status: "success",
        message:
          "Course updated successfully",
        course,
      });
    },
  );

  /**
   * Delete a course.
   */
  app.delete(
    "/cvs/:id/courses/:courseId",
    { preHandler: authenticate },
    async (request, reply) => {
      const { id: cvId } =
        cvIdParamSchema.parse(request.params);

      const { courseId } =
        courseIdParamSchema.parse(
          request.params,
        );

      const user = request.user as {
        sub: string;
      };

      const result =
        await courseService.delete(
          user.sub,
          cvId,
          courseId,
        );

      return reply.status(200).send({
        status: "success",
        message:
          "Course deleted successfully",
        ...result,
      });
    },
  );
}

import type {
  FastifyError,
  FastifyReply,
  FastifyRequest,
} from "fastify";
import { ZodError } from "zod";

export const errorHandler = (
  error: FastifyError,
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  request.log.error(error);

  /**
   * Zod validation errors are caused by invalid client input.
   * They must never be returned as HTTP 500.
   */
  if (error instanceof ZodError) {
    return reply.status(400).send({
      status: "error",
      message: "Invalid request data",
      errors: error.issues.map((issue) => ({
        path: issue.path,
        message: issue.message,
      })),
    });
  }

  return reply.status(error.statusCode ?? 500).send({
    status: "error",
    message:
      error.statusCode && error.statusCode < 500
        ? error.message
        : "Internal server error",
  });
};
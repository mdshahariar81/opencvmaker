import type { FastifyError, FastifyReply, FastifyRequest } from "fastify";

export const errorHandler = (
  error: FastifyError,
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  request.log.error(error);

  return reply.status(error.statusCode ?? 500).send({
    status: "error",
    message:
      error.statusCode && error.statusCode < 500
        ? error.message
        : "Internal server error",
  });
};
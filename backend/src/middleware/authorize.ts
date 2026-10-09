import type { FastifyReply, FastifyRequest } from "fastify";

import { AppError } from "../errors/app-error.js";

/**
 * Authorization middleware factory.
 *
 * Checks whether the authenticated user's role
 * is allowed to access a protected route.
 *
 * Authentication and authorization are separate:
 * - authenticate() verifies who the user is.
 * - authorize() verifies what the user is allowed to do.
 */
export function authorize(...allowedRoles: string[]) {
  return async (
    request: FastifyRequest,
    _reply: FastifyReply,
  ) => {
    // Authentication must happen before authorization.
    const user = request.user as {
      sub: string;
      role: string;
    };

    // Reject users whose role is not permitted.
    if (!allowedRoles.includes(user.role)) {
      throw new AppError("Access denied", 403);
    }
  };
}
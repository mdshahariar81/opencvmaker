import type { FastifyReply, FastifyRequest } from "fastify";

import { AppError } from "../errors/app-error.js";

/**
 * Authentication middleware.
 *
 * Verifies the JWT stored inside the HTTP-only
 * authentication cookie.
 *
 * After successful verification, the authenticated
 * user information is attached to the request.
 */
export async function authenticate(
  request: FastifyRequest,
  _reply: FastifyReply,
) {
  try {
    // Read the JWT from the HTTP-only authentication cookie.
    const token = request.cookies.ocm_access_token;

    // Reject requests without an authentication cookie.
    if (!token) {
      throw new AppError("Authentication required", 401);
    }

    // Verify the JWT and attach the decoded payload
    // to the current Fastify request.
    await request.jwtVerify({
      onlyCookie: true,
    });
  } catch {
    // Never expose internal JWT verification details.
    throw new AppError("Authentication required", 401);
  }
}
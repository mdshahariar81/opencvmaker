import type { FastifyInstance } from "fastify";

import { authService } from "../../services/auth/auth.service.js";
import { registerSchema } from "../../validation/auth/register.schema.js";

/**
 * Authentication routes.
 *
 * Handles HTTP requests related to authentication.
 */
export async function authRoutes(app: FastifyInstance) {
  /**
   * GET /auth/status
   *
   * Simple authentication route health check.
   */
  app.get("/auth/status", async () => {
    return {
      status: "ok",
      message: "Authentication route is working",
    };
  });

  /**
   * POST /auth/register
   *
   * Creates a new user account.
   *
   * Request body:
   * {
   *   name: string,
   *   email: string,
   *   password: string
   * }
   */
  app.post("/auth/register", async (request, reply) => {
    // Validate and normalize the incoming request body.
    const input = registerSchema.parse(request.body);

    // Pass validated data to the authentication service.
    const user = await authService.register(input);

    // Return the newly created safe user information.
    return reply.status(201).send({
      status: "success",
      message: "Account created successfully",
      user,
    });
  });
}
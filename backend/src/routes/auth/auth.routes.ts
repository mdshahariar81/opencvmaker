import type { FastifyInstance } from "fastify";

import { authService } from "../../services/auth/auth.service.js";
import { loginService } from "../../services/auth/login.service.js";
import { registerSchema } from "../../validation/auth/register.schema.js";
import { loginSchema } from "../../validation/auth/login.schema.js";

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

  /**
   * POST /auth/login
   *
   * Authenticates an existing user.
   *
   * Request body:
   * {
   *   email: string,
   *   password: string
   * }
   */
  app.post("/auth/login", async (request, reply) => {
    // Validate and normalize the incoming login credentials.
    const input = loginSchema.parse(request.body);

    // Authenticate the user through the login service.
    const user = await loginService.login(input);

    // Return safe user information.
    // Password/hash information is never exposed.
    return reply.status(200).send({
      status: "success",
      message: "Login successful",
      user,
    });
  });
}
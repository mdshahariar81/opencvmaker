import type { FastifyInstance } from "fastify";

import { authService } from "../../services/auth/auth.service.js";
import { loginService } from "../../services/auth/login.service.js";
import { loginSchema } from "../../validation/auth/login.schema.js";
import { registerSchema } from "../../validation/auth/register.schema.js";

/**
 * Authentication routes.
 *
 * Handles registration, login, and authentication-related
 * HTTP requests.
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

    // Create the user through the authentication service.
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
   *
   * Authentication flow:
   * 1. Validate credentials.
   * 2. Verify email and password.
   * 3. Create a short-lived JWT.
   * 4. Store JWT inside an HTTP-only cookie.
   * 5. Return safe user information.
   */
  app.post("/auth/login", async (request, reply) => {
    // Validate and normalize the incoming login credentials.
    const input = loginSchema.parse(request.body);

    // Verify the user's credentials.
    const user = await loginService.login(input);

    /**
     * Create the authentication JWT.
     *
     * `sub` identifies the authenticated user.
     * `role` will later be used for authorization.
     */
    const token = await app.jwt.sign({
      sub: user.id,
      role: user.role,
    });

    /**
     * Store the JWT in an HTTP-only cookie.
     *
     * httpOnly:
     * Prevents browser JavaScript from reading the token.
     *
     * secure:
     * Sends the cookie over HTTPS in production.
     *
     * sameSite:
     * Helps protect against cross-site request attacks.
     *
     * maxAge:
     * Matches the short-lived JWT lifetime.
     */
    reply.setCookie("ocm_access_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 15 * 60,
    });

    // Return safe user information.
    // The JWT itself is NOT returned in the response body.
    return reply.status(200).send({
      status: "success",
      message: "Login successful",
      user,
    });
  });
}
import type { FastifyInstance } from "fastify";

import { authService } from "../../services/auth/auth.service.js";
import { loginService } from "../../services/auth/login.service.js";
import { authenticate } from "../../middleware/authenticate.js";
import { userService } from "../../services/users/user.service.js";
import { AppError } from "../../errors/app-error.js";

import { loginSchema } from "../../validation/auth/login.schema.js";
import { registerSchema } from "../../validation/auth/register.schema.js";

/**
 * Authentication routes.
 *
 * Handles registration, login, current-user,
 * logout, and authentication-related HTTP requests.
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
   */
  app.post("/auth/register", async (request, reply) => {
    // Validate and normalize the incoming request body.
    const input = registerSchema.parse(request.body);

    // Create the user through the authentication service.
    const user = await authService.register(input);

    // Return safe user information.
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
   */
  app.post("/auth/login", async (request, reply) => {
    // Validate and normalize login credentials.
    const input = loginSchema.parse(request.body);

    // Verify email and password.
    const user = await loginService.login(input);

    // Create a short-lived JWT.
    const token = await app.jwt.sign({
      sub: user.id,
      role: user.role,
    });

    // Store the JWT inside an HTTP-only cookie.
    reply.setCookie("ocm_access_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 15 * 60,
    });

    // Return safe user information.
    return reply.status(200).send({
      status: "success",
      message: "Login successful",
      user,
    });
  });

  /**
   * GET /auth/me
   *
   * Returns the currently authenticated user.
   *
   * Protected route:
   * The authenticate middleware verifies the JWT
   * stored inside the HTTP-only cookie.
   */
  app.get(
    "/auth/me",
    {
      preHandler: authenticate,
    },
    async (request, reply) => {
      // JWT verification has already happened.
      // The `sub` claim contains the authenticated user's ID.
      const { sub } = request.user as {
        sub: string;
        role: string;
      };

      // Get the authenticated user through the service layer.
      const user = await userService.getUserById(sub);

      // The account may have been deleted after the token
      // was issued, so handle that case safely.
      if (!user) {
        throw new AppError("User not found", 404);
      }

      // Never expose the password hash.
      return reply.status(200).send({
        status: "success",
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt,
        },
      });
    },
  );

  /**
   * POST /auth/logout
   *
   * Logs the current user out by removing
   * the authentication cookie.
   */
  app.post("/auth/logout", async (_request, reply) => {
    // Remove the authentication cookie.
    reply.clearCookie("ocm_access_token", {
      path: "/",
    });

    return reply.status(200).send({
      status: "success",
      message: "Logout successful",
    });
  });
}
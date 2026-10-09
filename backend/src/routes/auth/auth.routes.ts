import type { FastifyInstance } from "fastify";

/**
 * Authentication routes.
 *
 * Authentication endpoints such as:
 * - Register
 * - Login
 * - Logout
 * - Current user
 *
 * will be added here.
 */
export async function authRoutes(app: FastifyInstance) {
  /**
   * Temporary authentication health endpoint.
   *
   * This confirms that the authentication route
   * is correctly registered before implementing
   * the actual authentication logic.
   */
  app.get("/auth/status", async () => {
    return {
      status: "ok",
      message: "Authentication route is working",
    };
  });
}
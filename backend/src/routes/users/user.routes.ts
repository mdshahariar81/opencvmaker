import type { FastifyInstance } from "fastify";

import { userService } from "../../services/users/user.service.js";

/**
 * User routes.
 *
 * HTTP request/response handling stays here.
 * Database and business logic are handled by userService.
 */
export async function userRoutes(app: FastifyInstance) {
  /**
   * GET /users
   *
   * Returns all registered users.
   */
  app.get("/users", async () => {
    const users = await userService.getAllUsers();

    return {
      status: "ok",
      count: users.length,
      users,
    };
  });
}
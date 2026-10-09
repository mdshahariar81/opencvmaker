import type { FastifyInstance } from "fastify";
import { db } from "../../config/database.js";

/**
 * User routes.
 *
 * This module will contain user-related API endpoints.
 * Authentication and authorization logic will be added
 * in the upcoming steps.
 */
export async function userRoutes(app: FastifyInstance) {
  /**
   * GET /users
   *
   * Returns all registered users from the database.
   */
  app.get("/users", async () => {
    const users = await db.orm.public.User.all();

    return {
      status: "ok",
      count: users.length,
      users,
    };
  });
}
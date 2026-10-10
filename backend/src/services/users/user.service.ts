import { db } from "../../config/database.js";

/**
 * User service.
 *
 * Keeps database and business logic separate
 * from HTTP route handlers.
 */
export const userService = {
  /**
   * Get all registered users.
   */
  async getAllUsers() {
    return db.orm.public.User.all();
  },

  /**
   * Get a single user by ID.
   *
   * Used by authenticated routes such as /auth/me.
   */
  async getUserById(id: string) {
    return db.orm.public.User
      .where({ id })
      .first();
  },
};
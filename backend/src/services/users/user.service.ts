import { db } from "../../config/database.js";

/**
 * User service.
 *
 * Keeps database/business logic separate from HTTP routes.
 */
export const userService = {
  /**
   * Get all registered users.
   */
  async getAllUsers() {
    return db.orm.public.User.all();
  },
};
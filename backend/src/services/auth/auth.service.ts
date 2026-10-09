import argon2 from "argon2";

import { db } from "../../config/database.js";
import { AppError } from "../../errors/app-error.js";
import type { RegisterInput } from "../../validation/auth/register.schema.js";

/**
 * Authentication service.
 *
 * Keeps authentication business logic separate
 * from the HTTP route layer.
 */
export const authService = {
  /**
   * Register a new user.
   *
   * Flow:
   * 1. Check whether the email already exists.
   * 2. Hash the password with Argon2.
   * 3. Create the user.
   * 4. Create an empty user profile.
   * 5. Return safe user information only.
   */
  async register(input: RegisterInput) {
    // Check whether another account already uses this email.
    const existingUser = await db.orm.public.User
      .where({ email: input.email })
      .first();

    // Prevent duplicate account registration.
    if (existingUser) {
        throw new AppError(
        "An account with this email already exists",
        409,
            );
    }

    // Never store the user's plain-text password.
    const passwordHash = await argon2.hash(input.password);

    // Create the main user account.
    // Prisma 8 create() receives the fields directly.
    const user = await db.orm.public.User.create({
      name: input.name,
      email: input.email,
      passwordHash,
    });

    // Create the user's profile record.
    await db.orm.public.UserProfile.create({
      userId: user.id,
    });

    // Never return passwordHash to the client.
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    };
  },
};
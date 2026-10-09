import argon2 from "argon2";

import { db } from "../../config/database.js";
import { AppError } from "../../errors/app-error.js";
import type { LoginInput } from "../../validation/auth/login.schema.js";

/**
 * Login service.
 *
 * Authentication business logic stays here,
 * separate from the HTTP route layer.
 */
export const loginService = {
  /**
   * Authenticate an existing user.
   *
   * Flow:
   * 1. Find the user by email.
   * 2. Verify the password using Argon2.
   * 3. Return safe user information.
   */
  async login(input: LoginInput) {
    // Find the account using the normalized email.
    const user = await db.orm.public.User
      .where({ email: input.email })
      .first();

    // Do not reveal whether the email exists.
    if (!user || !user.passwordHash) {
      throw new AppError("Invalid email or password", 401);
    }

    // Verify the plain-text password against the stored Argon2 hash.
    const passwordValid = await argon2.verify(
      user.passwordHash,
      input.password,
    );

    // Reject invalid credentials.
    if (!passwordValid) {
      throw new AppError("Invalid email or password", 401);
    }

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
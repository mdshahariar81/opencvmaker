import { db } from "../../config/database.js";
import { AppError } from "../../errors/app-error.js";
import type { TimestampString } from "@prisma/orm-postgres/target/codec-types";
import type { MembershipInput } from "../../validation/cv/membership.schema.js";

/**
 * Converts an ISO date string into the timestamp format
 * expected by the Prisma 8 contract runtime.
 */
function toTimestampString(
  value: string | undefined,
): TimestampString<3> | undefined {
  if (!value) {
    return undefined;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw new AppError("Invalid membership date", 400);
  }

  return date
    .toISOString()
    .slice(0, 23) as TimestampString<3>;
}

/**
 * Membership / Professional Affiliations service.
 *
 * Handles CRUD operations for memberships belonging to a CV.
 * Every operation verifies CV ownership before accessing records.
 */
export const membershipService = {
  /**
   * Get all memberships for a CV owned by the authenticated user.
   */
  async getAll(userId: string, cvId: string) {
    const cv = await db.orm.public.CV
      .where({
        id: cvId,
        userId,
      })
      .first();

    if (!cv) {
      throw new AppError("CV not found", 404);
    }

    return db.orm.public.Membership
      .where({
        cvId,
      })
      .all();
  },

  /**
   * Get one membership record belonging to the specified CV.
   */
  async getById(
    userId: string,
    cvId: string,
    membershipId: string,
  ) {
    const cv = await db.orm.public.CV
      .where({
        id: cvId,
        userId,
      })
      .first();

    if (!cv) {
      throw new AppError("CV not found", 404);
    }

    const membership =
      await db.orm.public.Membership
        .where({
          id: membershipId,
          cvId,
        })
        .first();

    if (!membership) {
      throw new AppError("Membership not found", 404);
    }

    return membership;
  },

  /**
   * Create a membership record for an owned CV.
   */
  async create(
    userId: string,
    cvId: string,
    input: MembershipInput,
  ) {
    const cv = await db.orm.public.CV
      .where({
        id: cvId,
        userId,
      })
      .first();

    if (!cv) {
      throw new AppError("CV not found", 404);
    }

    return db.orm.public.Membership.create({
      cvId,
      organization: input.organization,
      role: input.role,
      membershipType: input.membershipType,
      membershipId: input.membershipId,

      startDate: toTimestampString(input.startDate),
      endDate: toTimestampString(input.endDate),

      current: input.current ?? false,
      description: input.description,
      url: input.url,
      sortOrder: input.sortOrder ?? 0,
    });
  },

  /**
   * Update an existing membership record.
   * Undefined fields are left unchanged by the update operation.
   */
  async update(
    userId: string,
    cvId: string,
    membershipId: string,
    input: Partial<MembershipInput>,
  ) {
    const existingMembership = await this.getById(
      userId,
      cvId,
      membershipId,
    );

    return db.orm.public.Membership
      .where({
        id: existingMembership.id,
      })
      .update({
        organization: input.organization,
        role: input.role,
        membershipType: input.membershipType,
        membershipId: input.membershipId,

        startDate:
          input.startDate === undefined
            ? undefined
            : toTimestampString(input.startDate),

        endDate:
          input.endDate === undefined
            ? undefined
            : toTimestampString(input.endDate),

        current: input.current,
        description: input.description,
        url: input.url,
        sortOrder: input.sortOrder,
      });
  },

  /**
   * Delete a membership record after verifying CV ownership.
   */
  async delete(
    userId: string,
    cvId: string,
    membershipId: string,
  ) {
    const existingMembership = await this.getById(
      userId,
      cvId,
      membershipId,
    );

    await db.orm.public.Membership
      .where({
        id: existingMembership.id,
      })
      .delete();

    return {
      cvId,
      membershipId,
    };
  },
};
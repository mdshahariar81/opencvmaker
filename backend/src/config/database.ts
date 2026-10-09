import "dotenv/config";
import postgres from "@prisma/orm-postgres/runtime";
import type { Contract } from "../../prisma/contract.d.ts";
import contractJson from "../../prisma/contract.json" with { type: "json" };

/**
 * Prisma 8 PostgreSQL database client.
 *
 * contract.json
 * → Runtime database contract
 *
 * contract.d.ts
 * → TypeScript type information
 *
 * This shared client will be used by backend
 * routes and services.
 */
export const db = postgres<Contract>({
  contractJson,
  url: process.env["DATABASE_URL"]!,
});
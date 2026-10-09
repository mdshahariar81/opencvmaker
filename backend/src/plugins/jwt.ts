import fastifyJwt from "@fastify/jwt";
import fp from "fastify-plugin";
import type { FastifyInstance } from "fastify";

import { env } from "../config/env.js";

/**
 * JWT authentication plugin.
 *
 * fastify-plugin makes the JWT decorator available
 * to the entire Fastify application, including routes
 * registered outside this plugin.
 */
async function jwtPlugin(app: FastifyInstance) {
  if (!env.AUTH_SECRET) {
    throw new Error("AUTH_SECRET is required for JWT authentication");
  }

  await app.register(fastifyJwt, {
    secret: env.AUTH_SECRET,

    sign: {
      expiresIn: "15m",
    },
  });
}

/**
 * Export as a Fastify plugin.
 *
 * This prevents Fastify encapsulation from hiding
 * the JWT decorator from authentication routes.
 */
export default fp(jwtPlugin);
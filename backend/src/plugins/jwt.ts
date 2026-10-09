import fastifyJwt from "@fastify/jwt";
import fp from "fastify-plugin";
import type { FastifyInstance } from "fastify";

import { env } from "../config/env.js";

/**
 * JWT authentication plugin.
 *
 * JWT is stored inside an HTTP-only cookie so that
 * frontend JavaScript cannot directly access the token.
 */
async function jwtPlugin(app: FastifyInstance) {
  if (!env.AUTH_SECRET) {
    throw new Error("AUTH_SECRET is required for JWT authentication");
  }

  await app.register(fastifyJwt, {
    secret: env.AUTH_SECRET,

    /**
     * Tell @fastify/jwt which cookie contains
     * the authentication token.
     */
    cookie: {
      cookieName: "ocm_access_token",
      signed: false,
    },

    /**
     * Access tokens expire after 15 minutes.
     */
    sign: {
      expiresIn: "15m",
    },
  });
}

export default fp(jwtPlugin);
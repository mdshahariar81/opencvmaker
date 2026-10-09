import Fastify from "fastify";
import cors from "@fastify/cors";
import cookie from "@fastify/cookie";
import helmet from "@fastify/helmet";

import { env } from "./config/env.js";
import { errorHandler } from "./middleware/error-handlers.js";
import jwtPlugin from "./plugins/jwt.js";
import { cvRoutes } from "./routes/cvs/cv.routes.js";
import { healthRoute } from "./routes/health.js";
import { userRoutes } from "./routes/users/user.routes.js";
import { authRoutes } from "./routes/auth/auth.routes.js";

/**
 * Create Fastify application.
 */
const app = Fastify({
  logger: true,
});

/**
 * Centralized error handler.
 *
 * Handles application and HTTP errors
 * from all routes.
 */
app.setErrorHandler(errorHandler);

/**
 * Security headers.
 */
await app.register(helmet);

/**
 * Allow frontend to communicate with backend.
 *
 * NOTE:
 * In production, replace `origin: true`
 * with the actual frontend domain.
 */
await app.register(cors, {
  origin: true,
});

/**
 * Cookie support.
 *
 * This allows the backend to create and read
 * HTTP cookies for authentication.
 */
await app.register(cookie);

/**
 * JWT authentication.
 *
 * Registers JWT support before authentication
 * routes are initialized.
 */
await app.register(jwtPlugin);

/**
 * Application routes.
 */
await app.register(healthRoute);
await app.register(userRoutes);
await app.register(authRoutes);
await app.register(cvRoutes);

/**
 * Start the Fastify server.
 */
const startServer = async () => {
  try {
    await app.listen({
      port: env.PORT,
      host: "0.0.0.0",
    });

    console.log(
      `OpenCVMaker API running on http://localhost:${env.PORT}`,
    );
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
};

/**
 * Start application.
 */
startServer();
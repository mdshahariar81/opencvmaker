import Fastify from "fastify";
import cors from "@fastify/cors";
import cookie from "@fastify/cookie";
import helmet from "@fastify/helmet";

// Configuration
import { env } from "./config/env.js";

// Plugins
import jwtPlugin from "./plugins/jwt.js";

// Middleware
import { errorHandler } from "./middleware/error-handlers.js";

// General routes
import { healthRoute } from "./routes/health.js";
import { userRoutes } from "./routes/users/user.routes.js";
import { authRoutes } from "./routes/auth/auth.routes.js";

// CV routes
import { cvRoutes } from "./routes/cvs/cv.routes.js";
import { personalInformationRoutes } from "./routes/cvs/personal-information.routes.js";
import { professionalSummaryRoutes } from "./routes/cvs/professional-summary.routes.js";
import { educationRoutes } from "./routes/cvs/education.routes.js";
import { workExperienceRoutes } from "./routes/cvs/work-experience.routes.js";
import { skillRoutes } from "./routes/cvs/skill.routes.js";
import { projectRoutes } from "./routes/cvs/project.routes.js";
import { certificationRoutes } from "./routes/cvs/certification.routes.js";
import { languageRoutes } from "./routes/cvs/language.routes.js";
import { awardRoutes } from "./routes/cvs/award.routes.js";
import { volunteerExperienceRoutes } from "./routes/cvs/volunteer-experience.routes.js";

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
 * Allow the frontend to communicate with the backend.
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
 * Required for HTTP cookie-based authentication.
 */
await app.register(cookie);

/**
 * JWT authentication plugin.
 *
 * Must be registered before routes that
 * depend on JWT authentication.
 */
await app.register(jwtPlugin);

/**
 * Application routes.
 *
 * Routes are grouped logically:
 * 1. General application routes
 * 2. Core CV routes
 * 3. CV content sections
 */
await app.register(healthRoute);
await app.register(userRoutes);
await app.register(authRoutes);

await app.register(cvRoutes);

await app.register(personalInformationRoutes);
await app.register(professionalSummaryRoutes);
await app.register(educationRoutes);
await app.register(workExperienceRoutes);
await app.register(skillRoutes);
await app.register(projectRoutes);
await app.register(certificationRoutes);
await app.register(languageRoutes);
await app.register(awardRoutes);
await app.register(volunteerExperienceRoutes);

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
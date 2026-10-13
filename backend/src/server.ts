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
import { cvExportRoutes } from "./routes/cvs/cv-export.routes.js";
import { cvPublicRoutes } from "./routes/cvs/cv-public.routes.js";
import { cvStatusRoutes } from "./routes/cvs/cv-status.routes.js";
import { cvVersionRoutes } from "./routes/cvs/cv-version.routes.js";
import { cvSectionSettingRoutes } from "./routes/cvs/cv-section-setting.routes.js";
import { cvFullRoutes } from "./routes/cvs/cv-full.routes.js";
import { leadershipExperienceRoutes } from "./routes/cvs/leadership-experience.routes.js";
import { extracurricularActivityRoutes } from "./routes/cvs/extracurricular-activity.routes.js";
import { patentRoutes } from "./routes/cvs/patent.routes.js";
import { interestRoutes } from "./routes/cvs/interest.routes.js";
import { customSectionRoutes } from "./routes/cvs/custom-section.routes.js";
import { referenceRoutes } from "./routes/cvs/reference.routes.js";
import { teachingExperienceRoutes } from "./routes/cvs/teaching-experience.routes.js";
import { membershipRoutes } from "./routes/cvs/membership.routes.js";
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
import { publicationRoutes } from "./routes/cvs/publication.routes.js";
import { conferenceRoutes } from "./routes/cvs/conference.routes.js";
import { courseRoutes } from "./routes/cvs/course.routes.js";

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
await app.register(publicationRoutes);
await app.register(conferenceRoutes);
await app.register(courseRoutes);
await app.register(membershipRoutes);
await app.register(teachingExperienceRoutes);
await app.register(leadershipExperienceRoutes);
await app.register(extracurricularActivityRoutes);
await app.register(patentRoutes);
await app.register(interestRoutes);
await app.register(customSectionRoutes);
await app.register(referenceRoutes);
await app.register(cvFullRoutes);
await app.register(cvSectionSettingRoutes);
await app.register(cvVersionRoutes);
await app.register(cvStatusRoutes);
await app.register(cvPublicRoutes);
await app.register(cvExportRoutes);


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
import { authRoutes } from "./routes/auth/auth.routes.js";
import Fastify from "fastify";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import { env } from "./config/env.js";
import { errorHandler } from "./middleware/error-handlers.js";
import { healthRoute } from "./routes/health.js";
import { userRoutes } from "./routes/users/user.routes.js";

const app = Fastify({
  logger: true,
});

// Centralized error handler
app.setErrorHandler(errorHandler);

// Security headers
await app.register(helmet);

// Allow frontend to communicate with backend
await app.register(cors, {
  origin: true,
});

// Application routes
await app.register(healthRoute);
await app.register(userRoutes);
await app.register(authRoutes);

// Start server
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

startServer();
import Fastify from "fastify";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";

const app = Fastify({
  logger: true,
});

// Security headers
await app.register(helmet);

// Allow frontend to communicate with backend
await app.register(cors, {
  origin: true,
});

// Health check endpoint
app.get("/health", async () => {
  return {
    status: "ok",
    message: "OpenCVMaker API is running",
  };
});

// Start server
const startServer = async () => {
  try {
    await app.listen({
      port: 4000,
      host: "0.0.0.0",
    });

    console.log("OpenCVMaker API running on http://localhost:4000");
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
};

startServer();
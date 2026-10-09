import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),

  PORT: z.coerce.number().default(4000),

  DATABASE_URL: z.string().optional(),

  AUTH_SECRET: z.string().optional(),

  REDIS_URL: z.string().optional(),

  STORAGE_ENDPOINT: z.string().optional(),
  STORAGE_REGION: z.string().optional(),
  STORAGE_BUCKET: z.string().optional(),
  STORAGE_ACCESS_KEY: z.string().optional(),
  STORAGE_SECRET_KEY: z.string().optional(),

  EMAIL_FROM: z.string().optional(),
  EMAIL_SERVER_HOST: z.string().optional(),
  EMAIL_SERVER_PORT: z.coerce.number().optional(),
  EMAIL_SERVER_USER: z.string().optional(),
  EMAIL_SERVER_PASSWORD: z.string().optional(),

  PAYMENT_PROVIDER: z.string().optional(),
  PAYMENT_SECRET_KEY: z.string().optional(),
  PAYMENT_WEBHOOK_SECRET: z.string().optional(),

  AI_PROVIDER: z.string().optional(),
  AI_API_KEY: z.string().optional(),
});

export const env = envSchema.parse(process.env);
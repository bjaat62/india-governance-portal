import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().default(4000),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  CLIENT_URL: z.string().url().default("http://localhost:3000"),
  DATABASE_URL: z
    .string()
    .default("postgresql://postgres:postgres@localhost:5432/india_governance?schema=public"),
  JWT_SECRET: z.string().min(12).default("change-this-to-a-long-secret"),
  ADMIN_EMAIL: z.string().email().default("admin@indiagov.in"),
  ADMIN_PASSWORD: z.string().min(8).default("Admin@123")
});

export const env = envSchema.parse(process.env);

import { z } from 'zod';

export const CommonEnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().positive().optional(),
  MONGODB_URI: z.string().url().optional(),
});

const isProd = process.env.NODE_ENV === 'production';

export const GatewayEnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().positive().default(4000),
  FRONTEND_URL: isProd ? z.string().url() : z.string().url().default('http://localhost:3000'),
  SUPABASE_URL: z.string().url(),
  SUPABASE_PUBLISHABLE_KEY: isProd ? z.string() : z.string().default('placeholder-key'),
  USER_SERVICE_URL: isProd ? z.string().url() : z.string().url().default('http://localhost:4001'),
  LEARNING_SERVICE_URL: isProd ? z.string().url() : z.string().url().default('http://localhost:4002'),
  ROADMAP_SERVICE_URL: isProd ? z.string().url() : z.string().url().default('http://localhost:4003'),
  SCHEDULER_SERVICE_URL: isProd ? z.string().url() : z.string().url().default('http://localhost:4004'),
  AI_SERVICE_URL: isProd ? z.string().url() : z.string().url().default('http://localhost:4005'),
  RESOURCE_DOCUMENT_SERVICE_URL: isProd ? z.string().url() : z.string().url().default('http://localhost:4006'),
});

export function validateEnv<T>(schema: z.ZodSchema<T>, env: unknown): T {
  const result = schema.safeParse(env);
  if (!result.success) {
    console.error('❌ Environment validation failed:', JSON.stringify(result.error.format(), null, 2));
    throw new Error('Configuration validation error');
  }
  return result.data;
}

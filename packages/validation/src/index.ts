import { z } from 'zod';

export const CommonEnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().positive().optional(),
  MONGODB_URI: z.string().url().optional(),
});

export const GatewayEnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().positive().default(4000),
  FRONTEND_URL: z.string().url().default('http://localhost:3000'),
  SUPABASE_URL: z.string().url().default('https://placeholder.supabase.co'),
  SUPABASE_ANON_KEY: z.string().default('placeholder-key'),
});

export function validateEnv<T>(schema: z.ZodSchema<T>, env: unknown): T {
  const result = schema.safeParse(env);
  if (!result.success) {
    console.error('❌ Environment validation failed:', JSON.stringify(result.error.format(), null, 2));
    throw new Error('Configuration validation error');
  }
  return result.data;
}

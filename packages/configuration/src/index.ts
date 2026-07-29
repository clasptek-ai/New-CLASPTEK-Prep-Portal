import { z } from 'zod';

/**
 * @service Environment
 * Validated schemas for browser-safe client and administrative server configurations
 */

// Shared client-safe variables (prefixed with NEXT_PUBLIC_ for Next.js browser bundles)
export const clientEnvironmentSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url('NEXT_PUBLIC_SUPABASE_URL must be a valid HTTP URL'),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z
    .string()
    .min(10, 'NEXT_PUBLIC_SUPABASE_ANON_KEY must be provided'),
  CONFIG_VERSION: z.string().default('v4.0.1'),
});

// Server-only variables (never exposed to browser bundles)
export const serverEnvironmentSchema = clientEnvironmentSchema.extend({
  DATABASE_URL: z.string().min(1, 'DATABASE_URL must be a valid connection string'),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(10, 'SUPABASE_SERVICE_ROLE_KEY must be provided'),
  PORT: z
    .string()
    .transform((val) => parseInt(val, 10))
    .default('3000'),
});

export type ClientEnvironment = z.infer<typeof clientEnvironmentSchema>;
export type ServerEnvironment = z.infer<typeof serverEnvironmentSchema>;

/**
 * Validates and returns server environment parameters. Fails fast if settings are missing.
 */
export function loadEnvironment(customSource?: Record<string, any>): ServerEnvironment {
  const rawSource = customSource || process.env;
  const source = { ...rawSource };
  if (source.DATABASE_URL && source.DATABASE_URL.includes('pooler.supabase.com:5432')) {
    source.DATABASE_URL = source.DATABASE_URL.replace(
      'pooler.supabase.com:5432',
      'pooler.supabase.com:6543'
    );
  }
  const result = serverEnvironmentSchema.safeParse(source);
  if (!result.success) {
    const flattened = result.error.flatten();
    console.error(
      'Configuration startup failure: Invalid environment parameters',
      JSON.stringify(flattened, null, 2)
    );
    throw new Error(`Configuration validation failed: ${JSON.stringify(flattened.fieldErrors)}`);
  }
  return result.data;
}

/**
 * Validates and returns browser-safe environment parameters.
 */
export function loadClientEnvironment(customSource?: Record<string, any>): ClientEnvironment {
  const source = customSource || process.env;
  const result = clientEnvironmentSchema.safeParse(source);
  if (!result.success) {
    console.error(
      'Configuration browser startup failure: Invalid environment parameters',
      result.error.format()
    );
    throw new Error('Client configuration validation failed');
  }
  return result.data;
}

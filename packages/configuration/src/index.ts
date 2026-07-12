import { z } from 'zod';

/**
 * @service Environment
 * Validated schema for environment settings
 */
export const environmentSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  DATABASE_URL: z.string().url('DATABASE_URL must be a valid SQL connection URL').optional(),
  SUPABASE_URL: z.string().url('SUPABASE_URL must be a valid HTTP URL').optional(),
  SUPABASE_ANON_KEY: z.string().min(10, 'SUPABASE_ANON_KEY must be provided').optional(),
});

export type Environment = z.infer<typeof environmentSchema>;

export function loadEnvironment(customSource?: Record<string, any>): Environment {
  const source = customSource || process.env;
  const result = environmentSchema.safeParse(source);
  if (!result.success) {
    // eslint-disable-next-line no-console
    console.error(
      'Startup failure: Stated configuration parameters invalid',
      result.error.format()
    );
    throw new Error('Configuration validation failed');
  }
  return result.data;
}

import { describe, test, expect } from 'vitest';
import { loadEnvironment, loadClientEnvironment } from './index';

describe('Configuration Environment Unit Tests', () => {
  const validServerSource = {
    NODE_ENV: 'production',
    NEXT_PUBLIC_SUPABASE_URL: 'https://example.supabase.co',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: 'public-anon-key-string',
    CONFIG_VERSION: 'v1.2.0',
    DATABASE_URL: 'postgresql://postgres:password@localhost:5432/db',
    SUPABASE_SERVICE_ROLE_KEY: 'service-role-key-string-super-secret',
    PORT: '4000',
  };

  test('loadEnvironment parses correct variables', () => {
    const config = loadEnvironment(validServerSource);
    expect(config.NODE_ENV).toBe('production');
    expect(config.NEXT_PUBLIC_SUPABASE_URL).toBe('https://example.supabase.co');
    expect(config.NEXT_PUBLIC_SUPABASE_ANON_KEY).toBe('public-anon-key-string');
    expect(config.CONFIG_VERSION).toBe('v1.2.0');
    expect(config.DATABASE_URL).toBe('postgresql://postgres:password@localhost:5432/db');
    expect(config.SUPABASE_SERVICE_ROLE_KEY).toBe('service-role-key-string-super-secret');
    expect(config.PORT).toBe(4000);
  });

  test('loadEnvironment fails fast on missing required variables', () => {
    const invalidSource = { ...validServerSource, DATABASE_URL: undefined };
    expect(() => loadEnvironment(invalidSource)).toThrow('Configuration validation failed');
  });

  test('loadClientEnvironment ignores server variables and passes', () => {
    const clientSource = {
      NODE_ENV: 'production',
      NEXT_PUBLIC_SUPABASE_URL: 'https://example.supabase.co',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: 'public-anon-key-string',
      CONFIG_VERSION: 'v1.2.0',
    };

    const clientConfig = loadClientEnvironment(clientSource);
    expect(clientConfig.NEXT_PUBLIC_SUPABASE_URL).toBe('https://example.supabase.co');
    expect(clientConfig.CONFIG_VERSION).toBe('v1.2.0');
    expect((clientConfig as any).DATABASE_URL).toBeUndefined();
  });
});

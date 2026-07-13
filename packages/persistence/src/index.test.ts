import { describe, test, expect, vi } from 'vitest';
import { DatabasePool, createSupabaseBrowserClient, createSupabaseAdminClient } from './index';
import { ServerEnvironment } from '@clasptek/configuration';
import { Logger } from '@clasptek/observability';

// Mock pg module
vi.mock('pg', () => {
  return {
    Pool: vi.fn().mockImplementation(() => {
      return {
        connect: vi.fn().mockResolvedValue({
          release: vi.fn(),
        }),
        end: vi.fn().mockResolvedValue(undefined),
      };
    }),
  };
});

describe('Persistence Package Unit Tests', () => {
  const mockConfig: ServerEnvironment = {
    NODE_ENV: 'production',
    NEXT_PUBLIC_SUPABASE_URL: 'https://mock.supabase.co',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: 'mock-anon-key',
    CONFIG_VERSION: 'v1.2.0',
    DATABASE_URL: 'postgresql://postgres:postgres@localhost:5432/mock_db',
    SUPABASE_SERVICE_ROLE_KEY: 'mock-service-role-key',
    PORT: 3000,
  };

  const mockLogger: Logger = {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  };

  test('DatabasePool connects and disconnects successfully', async () => {
    const db = new DatabasePool(mockConfig, mockLogger);
    expect(db.getStatus()).toBe(false);

    await db.connect();
    expect(db.getStatus()).toBe(true);

    await db.disconnect();
    expect(db.getStatus()).toBe(false);
  });

  test('Supabase client helpers initialize definitions', () => {
    const browserClient = createSupabaseBrowserClient(
      mockConfig.NEXT_PUBLIC_SUPABASE_URL,
      mockConfig.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
    expect(browserClient).toBeDefined();

    const adminClient = createSupabaseAdminClient(
      mockConfig.NEXT_PUBLIC_SUPABASE_URL,
      mockConfig.SUPABASE_SERVICE_ROLE_KEY
    );
    expect(adminClient).toBeDefined();
  });
});

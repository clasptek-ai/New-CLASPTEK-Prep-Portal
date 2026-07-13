import { describe, test, expect, vi } from 'vitest';
import {
  PostgresSecurityProfileRepository,
  PostgresSecuritySessionRepository,
  PostgresRoleRepository,
  DatabasePool,
} from './index';
import { ServerEnvironment } from '@clasptek/configuration';
import { Logger } from '@clasptek/observability';

// Mock pg module queries
vi.mock('pg', () => {
  const queryMock = vi.fn().mockImplementation(async (sql: string) => {
    if (sql.includes('FROM security_profiles')) {
      return {
        rows: [
          {
            id: 'profile-id',
            user_id: 'user-id',
            preferred_mfa: 'TOTP',
            failed_attempts: 0,
            lock_status: 'UNLOCKED',
            security_preferences: {},
            version: 1,
          },
        ],
      };
    }
    if (sql.includes('FROM security_sessions')) {
      return {
        rows: [
          {
            id: 'session-id',
            user_id: 'user-id',
            supabase_session_id: 'supabase-id',
            browser: 'Chrome',
            ip_address: '127.0.0.1',
            country: 'US',
            device: 'Desktop',
            user_agent: 'Mozilla',
            login_timestamp: new Date(),
            revoked_by_admin: false,
            version: 1,
          },
        ],
      };
    }
    if (sql.includes('FROM roles')) {
      return {
        rows: [{ id: 'role-id', name: 'Admin', description: 'System Administrator', version: 1 }],
      };
    }
    return { rows: [] };
  });

  return {
    Pool: vi.fn().mockImplementation(() => {
      return {
        connect: vi.fn().mockResolvedValue({
          release: vi.fn(),
          query: queryMock,
        }),
        end: vi.fn().mockResolvedValue(undefined),
        query: queryMock,
      };
    }),
  };
});

describe('Postgres Authentication Persistence Tests', () => {
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

  test('PostgresSecurityProfileRepository finds profile correctly', async () => {
    const dbPool = new DatabasePool(mockConfig, mockLogger);
    await dbPool.connect();

    const repo = new PostgresSecurityProfileRepository(dbPool);
    const profile = await repo.findByUserId('user-id');

    expect(profile).toBeDefined();
    expect(profile?.lockStatus).toBe('UNLOCKED');
    expect(profile?.preferredMfa).toBe('TOTP');
  });

  test('PostgresSecuritySessionRepository finds session correctly', async () => {
    const dbPool = new DatabasePool(mockConfig, mockLogger);
    await dbPool.connect();

    const repo = new PostgresSecuritySessionRepository(dbPool);
    const session = await repo.findById('session-id');

    expect(session).toBeDefined();
    expect(session?.supabaseSessionId).toBe('supabase-id');
    expect(session?.revokedByAdmin).toBe(false);
  });

  test('PostgresRoleRepository finds role correctly', async () => {
    const dbPool = new DatabasePool(mockConfig, mockLogger);
    await dbPool.connect();

    const repo = new PostgresRoleRepository(dbPool);
    const role = await repo.findByName('Admin');

    expect(role).toBeDefined();
    expect(role?.name).toBe('Admin');
  });
});

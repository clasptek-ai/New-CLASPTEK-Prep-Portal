import { describe, test, expect, vi } from 'vitest';
import { PostgresIdentityRepository, DatabasePool } from './index';
import { UserId } from '@clasptek/domain-identity';
import { ServerEnvironment } from '@clasptek/configuration';
import { Logger } from '@clasptek/observability';

// Mock pg module queries
vi.mock('pg', () => {
  const queryMock = vi.fn().mockImplementation(async (sql: string) => {
    if (sql.includes('FROM users')) {
      return {
        rows: [{ id: '00000000-0000-0000-0000-000000000001', status: 'ACTIVE', version: 1 }],
      };
    }
    if (sql.includes('FROM identities')) {
      return {
        rows: [
          {
            id: '00000000-0000-0000-0000-000000000002',
            email: 'student@clasptek.edu',
            provider: 'LOCAL',
            is_verified: true,
            login_identifier: 'student@clasptek.edu',
          },
        ],
      };
    }
    if (sql.includes('FROM profiles')) {
      return {
        rows: [
          {
            id: '00000000-0000-0000-0000-000000000003',
            first_name: 'John',
            last_name: 'Doe',
            avatar: null,
            locale: 'en',
            time_zone: 'UTC',
          },
        ],
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

describe('Postgres Identity Mappings Tests', () => {
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

  test('PostgresIdentityRepository finds and maps User profiles correctly', async () => {
    const dbPool = new DatabasePool(mockConfig, mockLogger);
    await dbPool.connect();

    const repo = new PostgresIdentityRepository(dbPool);
    const user = await repo.findById(new UserId('00000000-0000-0000-0000-000000000001'));

    expect(user).toBeDefined();
    expect(user?.status).toBe('ACTIVE');
    expect(user?.identities.length).toBe(1);
    expect(user?.profile?.firstName.value).toBe('John');
    expect(user?.profile?.lastName.value).toBe('Doe');
  });
});

import { describe, test, expect, vi } from 'vitest';

// Pre-populate environment variables before config module loads
process.env.DATABASE_URL = 'postgresql://postgres:postgres@localhost:5432/mock_db';
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://mock.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'mock-anon-key';
process.env.CONFIG_VERSION = '1.0.0';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'mock-service-role-key';

import { loadEnvironment } from '@clasptek/configuration';
import { ConsoleLogger } from '@clasptek/observability';
import { DatabasePool, PostgresUnitOfWork, PostgresExamProductRepository } from './index';

vi.mock('pg', () => {
  return {
    Pool: class {
      public connect() {
        return {
          query: async () => ({ rows: [] }),
          release: () => {}
        };
      }
      public query() {
        return { rows: [] };
      }
    }
  };
});

describe('V3 PostgresExamProductRepository Persistence Tests', () => {
  test('findById returns null when query returns empty rows', async () => {
    const config = loadEnvironment(process.env);
    const logger = new ConsoleLogger('Test');
    const dbPool = new DatabasePool(config, logger);
    const uow = new PostgresUnitOfWork(dbPool);
    const repo = new PostgresExamProductRepository(uow);

    const product = await repo.findById('non-existent');
    expect(product).toBeNull();
  });
});

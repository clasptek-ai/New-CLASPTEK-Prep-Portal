import { Pool } from 'pg';
import { ServerEnvironment } from '@clasptek/configuration';
import { Logger } from '@clasptek/observability';

declare global {
  // Global singleton instance for Next.js dev server & hot reloading
  // Prevents Postgres connection pool exhaustion (EMAXCONNSESSION)
  var __globalPgPool: Pool | undefined;
}

function getSSLConfig(dbUrl: string): any {
  if (!dbUrl.includes('supabase')) return false;
  return { rejectUnauthorized: false };
}

export class DatabasePool {
  private pool: Pool | null = null;
  private isConnected = false;

  constructor(
    private readonly config: ServerEnvironment,
    private readonly logger: Logger
  ) {}

  public async connect(): Promise<void> {
    if (this.isConnected && this.pool) return;

    if (globalThis.__globalPgPool) {
      this.pool = globalThis.__globalPgPool;
      this.isConnected = true;
      return;
    }

    this.logger.info('Initializing Postgres database connection pool singleton...');
    try {
      const cleanUrl = this.config.DATABASE_URL.replace('sslmode=verify-full', 'sslmode=no-verify');
      const newPool = new Pool({
        connectionString: cleanUrl,
        max: 10,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
        ssl: getSSLConfig(cleanUrl),
      });

      // Acquire a client to verify database reachability
      const client = await newPool.connect();
      client.release();

      globalThis.__globalPgPool = newPool;
      this.pool = newPool;
      this.isConnected = true;
      this.logger.info('Postgres database connection pool singleton established successfully.');
    } catch (err: any) {
      this.logger.error('Failed to establish database connection pool singleton', err);
      throw err;
    }
  }

  public async disconnect(): Promise<void> {
    if (!this.isConnected || !this.pool) return;
    // In production node environment (not dev hot-reloading), close pool when requested
    if (process.env.NODE_ENV === 'production' && globalThis.__globalPgPool) {
      this.logger.info('Closing Postgres database connection pool singleton...');
      await globalThis.__globalPgPool.end();
      globalThis.__globalPgPool = undefined;
    }
    this.isConnected = false;
    this.pool = null;
  }

  public getStatus(): boolean {
    return this.isConnected && !!this.pool;
  }

  public getPool(): Pool {
    if (globalThis.__globalPgPool) {
      return globalThis.__globalPgPool;
    }
    if (!this.pool) {
      throw new Error('Pool is not initialized. Connect to the database first.');
    }
    return this.pool;
  }
}

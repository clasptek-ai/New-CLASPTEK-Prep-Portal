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

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

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

    const cleanUrl = this.config.DATABASE_URL.replace('sslmode=verify-full', 'sslmode=no-verify');
    const maxRetries = 3;
    let lastError: any = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const newPool = new Pool({
          connectionString: cleanUrl,
          max: 10,
          idleTimeoutMillis: 30000,
          connectionTimeoutMillis: 10000,
          ssl: getSSLConfig(cleanUrl),
        });

        // Add error handler for idle clients to prevent unhandled node errors
        newPool.on('error', (err) => {
          this.logger.warn('Unexpected error on idle Postgres pool client:', err);
        });

        // Acquire a client to verify database reachability
        const client = await newPool.connect();
        client.release();

        globalThis.__globalPgPool = newPool;
        this.pool = newPool;
        this.isConnected = true;
        this.logger.info('Postgres database connection pool singleton established successfully.');
        return;
      } catch (err: any) {
        lastError = err;
        this.logger.warn(
          `Database connection attempt ${attempt}/${maxRetries} failed: ${err.message || String(err)}`
        );
        if (attempt < maxRetries) {
          await delay(300 * Math.pow(2, attempt - 1));
        }
      }
    }

    this.logger.error(
      'Failed to establish database connection pool singleton after retries',
      lastError
    );
    throw lastError;
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

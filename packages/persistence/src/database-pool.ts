import { Pool } from 'pg';
import { ServerEnvironment } from '@clasptek/configuration';
import { Logger } from '@clasptek/observability';

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
    if (this.isConnected) return;
    this.logger.info('Initializing Postgres database connection pool...');
    try {
      const cleanUrl = this.config.DATABASE_URL.replace('sslmode=verify-full', 'sslmode=no-verify');
      this.pool = new Pool({
        connectionString: cleanUrl,
        max: 10,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
        ssl: getSSLConfig(cleanUrl),
      });
      // Try to acquire a client from the pool to verify database reachability
      const client = await this.pool.connect();
      client.release();
      this.isConnected = true;
      this.logger.info('Postgres database connection pool successfully established.');
    } catch (err: any) {
      this.logger.error('Failed to establish database connection pool', err);
      throw err;
    }
  }

  public async disconnect(): Promise<void> {
    if (!this.isConnected || !this.pool) return;
    this.logger.info('Closing Postgres database connection pool...');
    await this.pool.end();
    this.isConnected = false;
    this.pool = null;
  }

  public getStatus(): boolean {
    return this.isConnected;
  }

  public getPool(): Pool {
    if (!this.pool) {
      throw new Error('Pool is not initialized. Connect to the database first.');
    }
    return this.pool;
  }
}

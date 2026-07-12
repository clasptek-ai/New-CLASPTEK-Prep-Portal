import { Environment } from '@clasptek/configuration';
import { Logger } from '@clasptek/observability';

/**
 * @domain Database
 * @adapter Postgres
 * Persistence and database connection pool controls
 */

export interface Repository<TEntity, TId> {
  findById(id: TId): Promise<TEntity | null>;
  save(entity: TEntity): Promise<void>;
  delete?(id: TId): Promise<void>;
}

export class DatabasePool {
  private isConnected = false;

  constructor(
    private readonly config: Environment,
    private readonly logger: Logger
  ) {}

  public async connect(): Promise<void> {
    if (this.isConnected) return;
    this.logger.info('Simulating connection to database store...', {
      url: this.config.DATABASE_URL ? '[SECURED]' : undefined,
    });
    this.isConnected = true;
  }

  public async disconnect(): Promise<void> {
    if (!this.isConnected) return;
    this.logger.info('Closing database store connections...');
    this.isConnected = false;
  }

  public getStatus(): boolean {
    return this.isConnected;
  }
}

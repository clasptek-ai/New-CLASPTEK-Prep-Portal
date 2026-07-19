import { DatabasePool } from '../database-pool';
import { IUnitOfWork } from '@clasptek/application-exam-product';

export class PostgresUnitOfWork implements IUnitOfWork {
  private client: any = null;
  private outboxEvents: { eventType: string; aggregateType: string; aggregateId: string; payload: any }[] = [];

  constructor(private readonly dbPool: DatabasePool) {}

  public getActiveClient(): any {
    return this.client || this.dbPool.getPool();
  }

  public async begin(): Promise<void> {
    if (this.client) {
      return;
    }
    const pool = this.dbPool.getPool();
    this.client = await pool.connect();
    await this.client.query('BEGIN');
  }

  public async commit(): Promise<void> {
    if (!this.client) {
      throw new Error('No active transaction to commit.');
    }
    try {
      for (const event of this.outboxEvents) {
        await this.client.query(
          `INSERT INTO outbox_events (event_type, aggregate_type, aggregate_id, payload, occurred_at)
           VALUES ($1, $2, $3, $4, now())`,
          [event.eventType, event.aggregateType, event.aggregateId, JSON.stringify(event.payload)]
        );
      }
      this.outboxEvents = [];
      await this.client.query('COMMIT');
    } finally {
      this.client.release();
      this.client = null;
    }
  }

  public async rollback(): Promise<void> {
    if (!this.client) {
      return;
    }
    try {
      await this.client.query('ROLLBACK');
    } finally {
      this.client.release();
      this.client = null;
      this.outboxEvents = [];
    }
  }

  public registerOutbox(event: { eventType: string; aggregateType: string; aggregateId: string; payload: any }): void {
    this.outboxEvents.push(event);
  }
}

import { Pool } from 'pg';
import { QuestionImport, QuestionImportRepository } from '@clasptek/domain-question-bank';
import { randomUUID } from 'crypto';

export class PostgresQuestionImportRepository implements QuestionImportRepository {
  private readonly pool: Pool;

  constructor(poolOrDbPool: Pool | { getPool(): Pool }) {
    this.pool = 'getPool' in poolOrDbPool ? poolOrDbPool.getPool() : poolOrDbPool;
  }

  public nextIdentity(): string {
    return randomUUID();
  }

  public async save(importBatch: QuestionImport): Promise<void> {
    await this.pool.query(
      `
      INSERT INTO public.question_imports (id, format, status, total_records, error_details, created_at)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (id) DO UPDATE SET
        status = EXCLUDED.status,
        total_records = EXCLUDED.total_records,
        error_details = EXCLUDED.error_details
    `,
      [
        importBatch.id,
        importBatch.format,
        importBatch.status,
        importBatch.totalRecords,
        importBatch.errorDetails,
        importBatch.createdAt,
      ]
    );
  }

  public async findById(id: string): Promise<QuestionImport | null> {
    const res = await this.pool.query('SELECT * FROM public.question_imports WHERE id = $1', [id]);
    if (res.rows.length === 0) {
      return null;
    }
    const r = res.rows[0];
    return new QuestionImport(
      r.id,
      r.format,
      r.status,
      r.total_records,
      r.error_details,
      r.created_at
    );
  }

  public async existsDuplicateHash(hash: string): Promise<boolean> {
    const res = await this.pool.query(
      'SELECT 1 FROM public.duplicate_hashes WHERE hash_value = $1',
      [hash]
    );
    return res.rows.length > 0;
  }

  public async saveDuplicateHash(hash: string, questionId: string): Promise<void> {
    await this.pool.query(
      `
      INSERT INTO public.duplicate_hashes (hash_value, question_id)
      VALUES ($1, $2)
      ON CONFLICT (hash_value) DO NOTHING
    `,
      [hash, questionId]
    );
  }
}

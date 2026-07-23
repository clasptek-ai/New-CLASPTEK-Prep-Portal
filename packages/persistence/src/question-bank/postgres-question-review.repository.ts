import { Pool } from 'pg';
import { QuestionReview, QuestionReviewRepository } from '@clasptek/domain-question-bank';
import { randomUUID } from 'crypto';

export class PostgresQuestionReviewRepository implements QuestionReviewRepository {
  private readonly pool: Pool;

  constructor(poolOrDbPool: Pool | { getPool(): Pool }) {
    this.pool = 'getPool' in poolOrDbPool ? poolOrDbPool.getPool() : poolOrDbPool;
  }

  public nextIdentity(): string {
    return randomUUID();
  }

  public async save(review: QuestionReview): Promise<void> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      // Save core review
      await client.query(
        `
        INSERT INTO public.question_reviews (id, question_version_id, stage, assigned_reviewer_id, status, created_at, completed_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (id) DO UPDATE SET
          stage = EXCLUDED.stage,
          assigned_reviewer_id = EXCLUDED.assigned_reviewer_id,
          status = EXCLUDED.status,
          completed_at = EXCLUDED.completed_at
      `,
        [
          review.id,
          review.questionVersionId,
          review.stage,
          review.assignedReviewerId,
          review.status,
          review.createdAt,
          review.completedAt,
        ]
      );

      // Save comments (audit logs)
      for (const comment of review.comments) {
        await client.query(
          `
          INSERT INTO public.question_workflow_history (id, question_id, actor_id, action, comments, created_at)
          VALUES ($1, (SELECT question_id FROM public.question_versions WHERE id = $2), $3, $4, $5, $6)
          ON CONFLICT (id) DO NOTHING
        `,
          [
            comment.id,
            review.questionVersionId,
            comment.reviewerId,
            `COMMENT_ADDED_${review.stage.toUpperCase()}`,
            comment.commentText,
            comment.timestamp,
          ]
        );
      }

      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  public async findById(id: string): Promise<QuestionReview | null> {
    const res = await this.pool.query('SELECT * FROM public.question_reviews WHERE id = $1', [id]);
    if (res.rows.length === 0) {
      return null;
    }
    const r = res.rows[0];
    const review = new QuestionReview(
      r.id,
      r.question_version_id,
      r.stage,
      r.assigned_reviewer_id,
      r.status,
      r.created_at,
      r.completed_at
    );
    return review;
  }

  public async findByVersionId(versionId: string): Promise<QuestionReview[]> {
    const res = await this.pool.query(
      'SELECT * FROM public.question_reviews WHERE question_version_id = $1',
      [versionId]
    );
    return res.rows.map(
      (r) =>
        new QuestionReview(
          r.id,
          r.question_version_id,
          r.stage,
          r.assigned_reviewer_id,
          r.status,
          r.created_at,
          r.completed_at
        )
    );
  }
}

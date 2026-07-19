import { LearningFrameworkRepository, LearningFramework, LearningPath } from '@clasptek/domain-exam-product';
import { PostgresUnitOfWork } from './postgres-unit-of-work';

export class PostgresLearningFrameworkRepository implements LearningFrameworkRepository {
  constructor(private readonly uow: PostgresUnitOfWork) {}

  private get client() {
    return this.uow.getActiveClient();
  }

  public async findById(id: string): Promise<LearningFramework | null> {
    const res = await this.client.query('SELECT * FROM learning_frameworks WHERE id = $1 AND deleted_at IS NULL', [id]);
    if (res.rows.length === 0) return null;
    return this._hydrate(res.rows[0]);
  }

  public async findByCode(code: string): Promise<LearningFramework | null> {
    const res = await this.client.query('SELECT * FROM learning_frameworks WHERE code = $1 AND deleted_at IS NULL', [code]);
    if (res.rows.length === 0) return null;
    return this._hydrate(res.rows[0]);
  }

  public async exists(code: string): Promise<boolean> {
    const res = await this.client.query('SELECT 1 FROM learning_frameworks WHERE code = $1 AND deleted_at IS NULL LIMIT 1', [code]);
    return res.rows.length > 0;
  }

  public async save(framework: LearningFramework): Promise<void> {
    await this.client.query(
      `INSERT INTO learning_frameworks (id, exam_product_id, exam_product_version_id, skill_framework_version_id, code, name, description, framework_version, status, version_no, lock_version, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
       ON CONFLICT (id) DO UPDATE SET
         name = EXCLUDED.name,
         description = EXCLUDED.description,
         status = EXCLUDED.status,
         updated_at = now()`,
      [
        framework.id,
        framework.examProductId,
        framework.examProductVersionId,
        framework.skillFrameworkVersionId,
        framework.code,
        framework.name,
        framework.description || null,
        framework.frameworkVersion || null,
        framework.status,
        framework.versionNo,
        framework.lockVersion,
        framework.createdAt,
        framework.updatedAt,
      ]
    );

    // Save paths
    for (const p of framework.paths) {
      await this.client.query(
        `INSERT INTO learning_paths (id, learning_framework_id, code, name, path_type, display_order, parent_path_id, description, recommended_duration_hours, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         ON CONFLICT (id) DO UPDATE SET
           name = EXCLUDED.name,
           status = EXCLUDED.status`,
        [
          p.id,
          framework.id,
          p.code,
          p.name,
          p.pathType,
          p.displayOrder,
          p.parentPathId || null,
          p.description || null,
          p.recommendedDurationHours || null,
          p.status,
        ]
      );
    }
  }

  private async _hydrate(row: any): Promise<LearningFramework> {
    const framework = new LearningFramework(
      row.id,
      row.exam_product_id,
      row.exam_product_version_id,
      row.skill_framework_version_id,
      row.code,
      row.name,
      row.description || undefined,
      row.framework_version || undefined,
      row.status,
      Number(row.version_no),
      Number(row.lock_version),
      row.created_at,
      row.updated_at,
      row.deleted_at
    );

    // Hydrate paths
    const pathRes = await this.client.query('SELECT * FROM learning_paths WHERE learning_framework_id = $1 AND deleted_at IS NULL', [framework.id]);
    framework.loadPaths(
      pathRes.rows.map(
        (p: any) =>
          new LearningPath(
            p.id,
            p.learning_framework_id,
            p.code,
            p.name,
            p.path_type,
            Number(p.display_order),
            p.parent_path_id || undefined,
            p.description || undefined,
            p.recommended_duration_hours ? Number(p.recommended_duration_hours) : undefined,
            p.status
          )
      )
    );

    return framework;
  }
}

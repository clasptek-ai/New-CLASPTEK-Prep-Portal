import {
  ReadinessFrameworkRepository,
  ReadinessFramework,
  ReadinessCriteria,
} from '@clasptek/domain-exam-product';
import { PostgresUnitOfWork } from './postgres-unit-of-work';

export class PostgresReadinessFrameworkRepository implements ReadinessFrameworkRepository {
  constructor(private readonly uow: PostgresUnitOfWork) {}

  private get client() {
    return this.uow.getActiveClient();
  }

  public async findById(id: string): Promise<ReadinessFramework | null> {
    const res = await this.client.query(
      'SELECT * FROM readiness_frameworks WHERE id = $1 AND deleted_at IS NULL',
      [id]
    );
    if (res.rows.length === 0) return null;
    return this._hydrate(res.rows[0]);
  }

  public async findByCode(code: string): Promise<ReadinessFramework | null> {
    const res = await this.client.query(
      'SELECT * FROM readiness_frameworks WHERE code = $1 AND deleted_at IS NULL',
      [code]
    );
    if (res.rows.length === 0) return null;
    return this._hydrate(res.rows[0]);
  }

  public async exists(code: string): Promise<boolean> {
    const res = await this.client.query(
      'SELECT 1 FROM readiness_frameworks WHERE code = $1 AND deleted_at IS NULL LIMIT 1',
      [code]
    );
    return res.rows.length > 0;
  }

  public async save(framework: ReadinessFramework): Promise<void> {
    await this.client.query(
      `INSERT INTO readiness_frameworks (id, exam_product_id, exam_product_version_id, code, name, description, target_score_scheme_id, evaluation_strategy, minimum_confidence, status, version_no, lock_version, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
       ON CONFLICT (id) DO UPDATE SET
         name = EXCLUDED.name,
         description = EXCLUDED.description,
         status = EXCLUDED.status,
         updated_at = now()`,
      [
        framework.id,
        framework.examProductId,
        framework.examProductVersionId,
        framework.code,
        framework.name,
        framework.description || null,
        framework.targetScoreSchemeId || null,
        framework.evaluationStrategy || null,
        framework.minimumConfidence || null,
        framework.status,
        framework.versionNo,
        framework.lockVersion,
        framework.createdAt,
        framework.updatedAt,
      ]
    );

    // Save criteria
    for (const c of framework.criteria) {
      await this.client.query(
        `INSERT INTO readiness_criteria (id, readiness_framework_id, criterion_type, priority, official_exam_component_id, skill_revision_id, skill_level_id, learning_path_id, operator, target_value, minimum_value, maximum_value, weight, is_mandatory, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
         ON CONFLICT (id) DO UPDATE SET
           status = EXCLUDED.status`,
        [
          c.id,
          framework.id,
          c.criterionType,
          c.priority,
          c.officialExamComponentId || null,
          c.skillRevisionId || null,
          c.skillLevelId || null,
          c.learningPathId || null,
          c.operator || null,
          c.targetValue || null,
          c.minimumValue || null,
          c.maximumValue || null,
          c.weight,
          c.isMandatory,
          c.status,
        ]
      );
    }
  }

  private async _hydrate(row: any): Promise<ReadinessFramework> {
    const framework = new ReadinessFramework(
      row.id,
      row.exam_product_id,
      row.exam_product_version_id,
      row.code,
      row.name,
      row.description || undefined,
      row.target_score_scheme_id || undefined,
      row.evaluation_strategy || undefined,
      row.minimum_confidence ? Number(row.minimum_confidence) : undefined,
      row.status,
      Number(row.version_no),
      Number(row.lock_version),
      row.created_at,
      row.updated_at,
      row.deleted_at
    );

    // Hydrate criteria
    const critRes = await this.client.query(
      'SELECT * FROM readiness_criteria WHERE readiness_framework_id = $1 AND deleted_at IS NULL',
      [framework.id]
    );
    framework.loadCriteria(
      critRes.rows.map(
        (c: any) =>
          new ReadinessCriteria(
            c.id,
            c.readiness_framework_id,
            c.criterion_type,
            Number(c.priority),
            c.official_exam_component_id || undefined,
            c.skill_revision_id || undefined,
            c.skill_level_id || undefined,
            c.learning_path_id || undefined,
            c.operator || undefined,
            c.target_value ? Number(c.target_value) : undefined,
            c.minimum_value ? Number(c.minimum_value) : undefined,
            c.maximum_value ? Number(c.maximum_value) : undefined,
            Number(c.weight),
            c.is_mandatory,
            c.status
          )
      )
    );

    return framework;
  }
}

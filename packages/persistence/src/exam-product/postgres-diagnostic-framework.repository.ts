import { DiagnosticFrameworkRepository, DiagnosticFramework, DiagnosticRule } from '@clasptek/domain-exam-product';
import { PostgresUnitOfWork } from './postgres-unit-of-work';

export class PostgresDiagnosticFrameworkRepository implements DiagnosticFrameworkRepository {
  constructor(private readonly uow: PostgresUnitOfWork) {}

  private get client() {
    return this.uow.getActiveClient();
  }

  public async findById(id: string): Promise<DiagnosticFramework | null> {
    const res = await this.client.query('SELECT * FROM diagnostic_frameworks WHERE id = $1 AND deleted_at IS NULL', [id]);
    if (res.rows.length === 0) return null;
    return this._hydrate(res.rows[0]);
  }

  public async findByCode(code: string): Promise<DiagnosticFramework | null> {
    const res = await this.client.query('SELECT * FROM diagnostic_frameworks WHERE code = $1 AND deleted_at IS NULL', [code]);
    if (res.rows.length === 0) return null;
    return this._hydrate(res.rows[0]);
  }

  public async exists(code: string): Promise<boolean> {
    const res = await this.client.query('SELECT 1 FROM diagnostic_frameworks WHERE code = $1 AND deleted_at IS NULL LIMIT 1', [code]);
    return res.rows.length > 0;
  }

  public async save(framework: DiagnosticFramework): Promise<void> {
    await this.client.query(
      `INSERT INTO diagnostic_frameworks (id, exam_product_id, exam_product_version_id, code, name, framework_type, description, minimum_evidence_count, confidence_threshold, fallback_learning_path_id, status, version_no, lock_version, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
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
        framework.frameworkType,
        framework.description || null,
        framework.minimumEvidenceCount || null,
        framework.confidenceThreshold || null,
        framework.fallbackLearningPathId || null,
        framework.status,
        framework.versionNo,
        framework.lockVersion,
        framework.createdAt,
        framework.updatedAt,
      ]
    );

    // Save rules
    for (const r of framework.rules) {
      await this.client.query(
        `INSERT INTO diagnostic_rules (id, diagnostic_framework_id, rule_type, priority, official_exam_component_id, skill_revision_id, skill_level_id, recommended_learning_path_id, operator, minimum_value, maximum_value, weight, confidence_threshold, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
         ON CONFLICT (id) DO UPDATE SET
           status = EXCLUDED.status`,
        [
          r.id,
          framework.id,
          r.ruleType,
          r.priority,
          r.officialExamComponentId || null,
          r.skillRevisionId || null,
          r.skillLevelId || null,
          r.recommendedLearningPathId || null,
          r.operator || null,
          r.minimumValue || null,
          r.maximumValue || null,
          r.weight,
          r.confidenceThreshold || null,
          r.status,
        ]
      );
    }
  }

  private async _hydrate(row: any): Promise<DiagnosticFramework> {
    const framework = new DiagnosticFramework(
      row.id,
      row.exam_product_id,
      row.exam_product_version_id,
      row.code,
      row.name,
      row.framework_type,
      row.description || undefined,
      row.minimum_evidence_count ? Number(row.minimum_evidence_count) : undefined,
      row.confidence_threshold ? Number(row.confidence_threshold) : undefined,
      row.fallback_learning_path_id || undefined,
      row.status,
      Number(row.version_no),
      Number(row.lock_version),
      row.created_at,
      row.updated_at,
      row.deleted_at
    );

    // Hydrate rules
    const ruleRes = await this.client.query('SELECT * FROM diagnostic_rules WHERE diagnostic_framework_id = $1 AND deleted_at IS NULL', [framework.id]);
    framework.loadRules(
      ruleRes.rows.map(
        (r: any) =>
          new DiagnosticRule(
            r.id,
            r.diagnostic_framework_id,
            r.rule_type,
            Number(r.priority),
            r.official_exam_component_id || undefined,
            r.skill_revision_id || undefined,
            r.skill_level_id || undefined,
            r.recommended_learning_path_id || undefined,
            r.operator || undefined,
            r.minimum_value ? Number(r.minimum_value) : undefined,
            r.maximum_value ? Number(r.maximum_value) : undefined,
            Number(r.weight),
            r.confidence_threshold ? Number(r.confidence_threshold) : undefined,
            r.status
          )
      )
    );

    return framework;
  }
}

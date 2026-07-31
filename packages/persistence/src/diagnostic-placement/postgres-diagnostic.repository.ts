import { Pool } from 'pg';
import {
  DiagnosticCatalog,
  AssessmentForm,
  DiagnosticAttempt,
  Response,
  PlacementResult,
  SkillProfile,
  ExposureLedger,
  SelectionAudit,
  Recommendation,
  StageName,
} from '@clasptek/domain-diagnostic-placement';
import {
  DiagnosticRepository,
  AssessmentFormRepository,
  AttemptRepository,
  ResponseRepository,
  PlacementRepository,
  SkillProfileRepository,
  RecommendationRepository,
  ExposureLedgerRepository,
  SelectionAuditRepository,
} from '@clasptek/application-diagnostic-placement';

export class PostgresDiagnosticRepository implements DiagnosticRepository {
  constructor(private readonly pool: Pool) {}

  public async findById(id: string): Promise<DiagnosticCatalog | null> {
    const res = await this.pool.query(
      'SELECT * FROM public.diagnostic_catalogs WHERE id = $1 AND deleted_at IS NULL',
      [id]
    );
    if (res.rows.length === 0) return null;
    const r = res.rows[0];
    return new DiagnosticCatalog(
      r.id,
      r.exam_product_id,
      r.code,
      r.name,
      r.description,
      r.status,
      r.version_no,
      r.tenant_id,
      r.created_at,
      r.updated_at,
      r.deleted_at
    );
  }

  public async findByCode(code: string): Promise<DiagnosticCatalog | null> {
    const res = await this.pool.query(
      'SELECT * FROM public.diagnostic_catalogs WHERE code = $1 AND deleted_at IS NULL',
      [code]
    );
    if (res.rows.length === 0) return null;
    const r = res.rows[0];
    return new DiagnosticCatalog(
      r.id,
      r.exam_product_id,
      r.code,
      r.name,
      r.description,
      r.status,
      r.version_no,
      r.tenant_id,
      r.created_at,
      r.updated_at,
      r.deleted_at
    );
  }

  public async save(catalog: DiagnosticCatalog): Promise<void> {
    await this.pool.query(
      `INSERT INTO public.diagnostic_catalogs (id, exam_product_id, code, name, description, status, version_no, tenant_id, created_at, updated_at, deleted_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       ON CONFLICT (id) DO UPDATE SET
         name = EXCLUDED.name,
         description = EXCLUDED.description,
         status = EXCLUDED.status,
         version_no = EXCLUDED.version_no,
         updated_at = EXCLUDED.updated_at,
         deleted_at = EXCLUDED.deleted_at`,
      [
        catalog.id,
        catalog.examProductId,
        catalog.code,
        catalog.name,
        catalog.description,
        catalog.status,
        catalog.versionNo,
        catalog.tenantId,
        catalog.createdAt,
        catalog.updatedAt,
        catalog.deletedAt,
      ]
    );
  }
}

export class PostgresAssessmentFormRepository implements AssessmentFormRepository {
  constructor(private readonly pool: Pool) {}

  public async findById(id: string): Promise<AssessmentForm | null> {
    const res = await this.pool.query(
      'SELECT * FROM public.assessment_forms WHERE id = $1 AND deleted_at IS NULL',
      [id]
    );
    if (res.rows.length === 0) return null;
    const r = res.rows[0];
    return new AssessmentForm(
      r.id,
      r.catalog_id,
      r.code,
      r.name,
      r.description,
      r.duration_minutes,
      r.total_questions,
      r.blueprint_config,
      r.tenant_id,
      r.created_at,
      r.updated_at,
      r.deleted_at
    );
  }

  public async findByCatalogId(catalogId: string): Promise<AssessmentForm | null> {
    const res = await this.pool.query(
      'SELECT * FROM public.assessment_forms WHERE catalog_id = $1 AND deleted_at IS NULL LIMIT 1',
      [catalogId]
    );
    if (res.rows.length === 0) return null;
    const r = res.rows[0];
    return new AssessmentForm(
      r.id,
      r.catalog_id,
      r.code,
      r.name,
      r.description,
      r.duration_minutes,
      r.total_questions,
      r.blueprint_config,
      r.tenant_id,
      r.created_at,
      r.updated_at,
      r.deleted_at
    );
  }

  public async save(form: AssessmentForm): Promise<void> {
    await this.pool.query(
      `INSERT INTO public.assessment_forms (id, catalog_id, code, name, description, duration_minutes, total_questions, blueprint_config, tenant_id, created_at, updated_at, deleted_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       ON CONFLICT (id) DO UPDATE SET
         name = EXCLUDED.name,
         description = EXCLUDED.description,
         duration_minutes = EXCLUDED.duration_minutes,
         total_questions = EXCLUDED.total_questions,
         blueprint_config = EXCLUDED.blueprint_config,
         updated_at = EXCLUDED.updated_at,
         deleted_at = EXCLUDED.deleted_at`,
      [
        form.id,
        form.catalogId,
        form.code,
        form.name,
        form.description,
        form.durationMinutes,
        form.totalQuestions,
        form.blueprintConfig,
        form.tenantId,
        form.createdAt,
        form.updatedAt,
        form.deletedAt,
      ]
    );
  }
}

export class PostgresAttemptRepository implements AttemptRepository {
  constructor(private readonly pool: Pool) {}

  public async findById(id: string): Promise<DiagnosticAttempt | null> {
    const res = await this.pool.query(
      'SELECT * FROM public.diagnostic_attempts WHERE id = $1 AND deleted_at IS NULL',
      [id]
    );
    if (res.rows.length === 0) return null;
    const r = res.rows[0];
    const attempt = new DiagnosticAttempt(
      r.id,
      r.student_id,
      r.catalog_id,
      r.status,
      r.started_at,
      r.closed_at,
      r.score ? parseFloat(r.score) : null,
      r.tenant_id,
      r.created_at,
      r.updated_at,
      r.deleted_at
    );

    // Load responses
    const respRes = await this.pool.query(
      'SELECT * FROM public.diagnostic_responses WHERE attempt_id = $1',
      [id]
    );
    const responses = respRes.rows.map(
      (resp) =>
        new Response(
          resp.id,
          resp.attempt_id,
          resp.question_id,
          resp.question_version_id,
          resp.response_payload,
          resp.is_correct,
          resp.time_spent_ms,
          resp.tenant_id,
          resp.created_at,
          resp.updated_at
        )
    );
    attempt.loadResponses(responses);
    return attempt;
  }

  public async findActiveByStudentId(
    studentId: string,
    catalogId: string
  ): Promise<DiagnosticAttempt | null> {
    const res = await this.pool.query(
      "SELECT id FROM public.diagnostic_attempts WHERE student_id = $1 AND catalog_id = $2 AND status = 'STARTED' AND deleted_at IS NULL LIMIT 1",
      [studentId, catalogId]
    );
    if (res.rows.length === 0) return null;
    return this.findById(res.rows[0].id);
  }

  public async save(attempt: DiagnosticAttempt): Promise<void> {
    await this.pool.query(
      `INSERT INTO public.diagnostic_attempts (id, student_id, catalog_id, status, started_at, closed_at, score, tenant_id, created_at, updated_at, deleted_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       ON CONFLICT (id) DO UPDATE SET
         status = EXCLUDED.status,
         closed_at = EXCLUDED.closed_at,
         score = EXCLUDED.score,
         updated_at = EXCLUDED.updated_at,
         deleted_at = EXCLUDED.deleted_at`,
      [
        attempt.id,
        attempt.studentId,
        attempt.catalogId,
        attempt.status,
        attempt.startedAt,
        attempt.closedAt,
        attempt.score,
        attempt.tenantId,
        attempt.createdAt,
        attempt.updatedAt,
        attempt.deletedAt,
      ]
    );
  }
}

export class PostgresResponseRepository implements ResponseRepository {
  constructor(private readonly pool: Pool) {}

  public async save(response: Response): Promise<void> {
    await this.pool.query(
      `INSERT INTO public.diagnostic_responses (id, attempt_id, question_id, question_version_id, response_payload, is_correct, time_spent_ms, tenant_id, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       ON CONFLICT (id) DO UPDATE SET
         response_payload = EXCLUDED.response_payload,
         is_correct = EXCLUDED.is_correct,
         time_spent_ms = EXCLUDED.time_spent_ms,
         updated_at = EXCLUDED.updated_at`,
      [
        response.id,
        response.attemptId,
        response.questionId,
        response.questionVersionId,
        response.responsePayload,
        response.isCorrect,
        response.timeSpentMs,
        response.tenantId,
        response.createdAt,
        response.updatedAt,
      ]
    );
  }

  public async findByAttemptId(attemptId: string): Promise<Response[]> {
    const res = await this.pool.query(
      'SELECT * FROM public.diagnostic_responses WHERE attempt_id = $1',
      [attemptId]
    );
    return res.rows.map(
      (r) =>
        new Response(
          r.id,
          r.attempt_id,
          r.question_id,
          r.question_version_id,
          r.response_payload,
          r.is_correct,
          r.time_spent_ms,
          r.tenant_id,
          r.created_at,
          r.updated_at
        )
    );
  }
}

export class PostgresPlacementRepository implements PlacementRepository {
  constructor(private readonly pool: Pool) {}

  public async findById(id: string): Promise<PlacementResult | null> {
    const res = await this.pool.query('SELECT * FROM public.placement_results WHERE id = $1', [id]);
    if (res.rows.length === 0) return null;
    const r = res.rows[0];
    return new PlacementResult(
      r.id,
      r.attempt_id,
      r.student_id,
      r.placement_stage as StageName,
      parseFloat(r.confidence_percentage),
      parseFloat(r.reliability_score),
      parseFloat(r.blueprint_coverage),
      parseFloat(r.difficulty_coverage),
      r.questions_answered,
      r.tenant_id,
      r.created_at
    );
  }

  public async findByAttemptId(attemptId: string): Promise<PlacementResult | null> {
    const res = await this.pool.query(
      'SELECT * FROM public.placement_results WHERE attempt_id = $1 LIMIT 1',
      [attemptId]
    );
    if (res.rows.length === 0) return null;
    return this.findById(res.rows[0].id);
  }

  public async save(placement: PlacementResult): Promise<void> {
    await this.pool.query(
      `INSERT INTO public.placement_results (id, attempt_id, student_id, placement_stage, confidence_percentage, reliability_score, blueprint_coverage, difficulty_coverage, questions_answered, tenant_id, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       ON CONFLICT (id) DO UPDATE SET
         placement_stage = EXCLUDED.placement_stage,
         confidence_percentage = EXCLUDED.confidence_percentage,
         reliability_score = EXCLUDED.reliability_score,
         blueprint_coverage = EXCLUDED.blueprint_coverage,
         difficulty_coverage = EXCLUDED.difficulty_coverage,
         questions_answered = EXCLUDED.questions_answered`,
      [
        placement.id,
        placement.attemptId,
        placement.studentId,
        placement.placementStage,
        placement.confidencePercentage,
        placement.reliabilityScore,
        placement.blueprintCoverage,
        placement.difficultyCoverage,
        placement.questionsAnswered,
        placement.tenantId,
        placement.createdAt,
      ]
    );
  }
}

export class PostgresSkillProfileRepository implements SkillProfileRepository {
  constructor(private readonly pool: Pool) {}

  public async findByStudentAndSkill(
    studentId: string,
    skillCode: string
  ): Promise<SkillProfile | null> {
    const res = await this.pool.query(
      'SELECT * FROM public.student_skill_profiles WHERE student_id = $1 AND skill_code = $2',
      [studentId, skillCode]
    );
    if (res.rows.length === 0) return null;
    const r = res.rows[0];
    return new SkillProfile(
      r.id,
      r.student_id,
      r.skill_code,
      parseFloat(r.mastery_percentage),
      r.computed_stage as StageName,
      r.tenant_id,
      r.created_at,
      r.updated_at
    );
  }

  public async findByStudentId(studentId: string): Promise<SkillProfile[]> {
    const res = await this.pool.query(
      'SELECT * FROM public.student_skill_profiles WHERE student_id = $1',
      [studentId]
    );
    return res.rows.map(
      (r) =>
        new SkillProfile(
          r.id,
          r.student_id,
          r.skill_code,
          parseFloat(r.mastery_percentage),
          r.computed_stage as StageName,
          r.tenant_id,
          r.created_at,
          r.updated_at
        )
    );
  }

  public async save(profile: SkillProfile): Promise<void> {
    await this.pool.query(
      `INSERT INTO public.student_skill_profiles (id, student_id, skill_code, mastery_percentage, computed_stage, tenant_id, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (student_id, skill_code) DO UPDATE SET
         mastery_percentage = EXCLUDED.mastery_percentage,
         computed_stage = EXCLUDED.computed_stage,
         updated_at = EXCLUDED.updated_at`,
      [
        profile.id,
        profile.studentId,
        profile.skillCode,
        profile.masteryPercentage,
        profile.computedStage,
        profile.tenantId,
        profile.createdAt,
        profile.updatedAt,
      ]
    );
  }
}

export class PostgresRecommendationRepository implements RecommendationRepository {
  constructor(private readonly pool: Pool) {}

  public async findByStudentId(studentId: string): Promise<Recommendation[]> {
    const res = await this.pool.query(
      "SELECT * FROM public.diagnostic_recommendations WHERE student_id = $1 AND status = 'ACTIVE'",
      [studentId]
    );
    return res.rows.map(
      (r) =>
        new Recommendation(
          r.id,
          r.placement_result_id,
          r.student_id,
          r.recommended_learning_path_id,
          r.priority,
          r.title,
          r.description,
          r.status as any,
          r.tenant_id,
          r.created_at
        )
    );
  }

  public async save(recommendation: Recommendation): Promise<void> {
    await this.pool.query(
      `INSERT INTO public.diagnostic_recommendations (id, placement_result_id, student_id, recommended_learning_path_id, priority, title, description, status, tenant_id, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       ON CONFLICT (id) DO UPDATE SET
         status = EXCLUDED.status`,
      [
        recommendation.id,
        recommendation.placementResultId,
        recommendation.studentId,
        recommendation.recommendedLearningPathId,
        recommendation.priority,
        recommendation.title,
        recommendation.description,
        recommendation.status,
        recommendation.tenantId,
        recommendation.createdAt,
      ]
    );
  }
}

export class PostgresExposureLedgerRepository implements ExposureLedgerRepository {
  constructor(private readonly pool: Pool) {}

  public async save(ledger: ExposureLedger): Promise<void> {
    await this.pool.query(
      `INSERT INTO public.exposure_ledger (id, student_id, question_id, attempt_id, rendered_at, tenant_id)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (id) DO NOTHING`,
      [
        ledger.id,
        ledger.studentId,
        ledger.questionId,
        ledger.attemptId,
        ledger.renderedAt,
        ledger.tenantId,
      ]
    );
  }

  public async hasBeenExposed(studentId: string, questionId: string): Promise<boolean> {
    const res = await this.pool.query(
      'SELECT 1 FROM public.exposure_ledger WHERE student_id = $1 AND question_id = $2 LIMIT 1',
      [studentId, questionId]
    );
    return res.rows.length > 0;
  }
}

export class PostgresSelectionAuditRepository implements SelectionAuditRepository {
  constructor(private readonly pool: Pool) {}

  public async save(audit: SelectionAudit): Promise<void> {
    await this.pool.query(
      `INSERT INTO public.selection_audits (id, attempt_id, question_id, selection_reason, random_seed, selected_at, tenant_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (id) DO NOTHING`,
      [
        audit.id,
        audit.attemptId,
        audit.questionId,
        audit.selectionReason,
        audit.randomSeed,
        audit.selectedAt,
        audit.tenantId,
      ]
    );
  }
}

import { Pool } from 'pg';
import { Question, QuestionRepository } from '@clasptek/domain-question-bank';

export interface QuestionSummaryDTO {
  id: string;
  code: string;
  prompt: string;
  payload: Record<string, any>;
  explanation: string | null;
  tags: string[];
  difficultyRating: string;
  tenantId: string;
}

export interface ReviewQueueDTO {
  id: string;
  questionVersionId: string;
  stage: string;
  assignedReviewerId: string;
  status: string;
  createdAt: Date;
}

export interface StatisticsDTO {
  id: string;
  questionVersionId: string;
  facilityIndex: number;
  discriminationIndex: number;
  pointBiserial: number;
  irtParameterA: number;
  irtParameterB: number;
  irtParameterC: number;
}

export class SearchQuestionsHandler {
  constructor(private readonly pool: Pool) {}

  public async execute(filters: {
    tenantId?: string;
    difficulty?: string;
    tag?: string;
    examProductId?: string;
    curriculumModuleId?: string;
    status?: string;
  }): Promise<QuestionSummaryDTO[]> {
    const tenantId = filters.tenantId || '00000000-0000-0000-0000-000000000000';
    let sql = `
      SELECT 
        id,
        code,
        prompt,
        payload,
        explanation,
        tags,
        difficulty_rating as "difficultyRating",
        tenant_id as "tenantId"
      FROM question_read.materialized_questions
      WHERE tenant_id = $1
    `;
    const params: any[] = [tenantId];

    if (filters.difficulty) {
      sql += ' AND difficulty_rating = $2';
      params.push(filters.difficulty);
    }

    const res = await this.pool.query(sql, params);
    return res.rows;
  }
}

export class QuestionHistoryHandler {
  constructor(private readonly pool: Pool) {}

  public async execute(questionId: string): Promise<any[]> {
    const sql = `
      SELECT id, actor_id as "actorId", action, comments, created_at as "createdAt"
      FROM public.question_workflow_history
      WHERE question_id = $1
      ORDER BY created_at DESC
    `;
    const res = await this.pool.query(sql, [questionId]);
    return res.rows;
  }
}

export class ReviewQueueHandler {
  constructor(private readonly pool: Pool) {}

  public async execute(reviewerId: string): Promise<ReviewQueueDTO[]> {
    const sql = `
      SELECT 
        id,
        question_version_id as "questionVersionId",
        stage,
        assigned_reviewer_id as "assignedReviewerId",
        status,
        created_at as "createdAt"
      FROM public.question_reviews
      WHERE assigned_reviewer_id = $1 AND status = 'pending'
    `;
    const res = await this.pool.query(sql, [reviewerId]);
    return res.rows;
  }
}

export class PublishedQuestionsHandler {
  constructor(private readonly pool: Pool) {}

  public async execute(tenantId: string): Promise<QuestionSummaryDTO[]> {
    const sql = `
      SELECT 
        id,
        code,
        prompt,
        payload,
        explanation,
        tags,
        difficulty_rating as "difficultyRating",
        tenant_id as "tenantId"
      FROM question_read.materialized_questions
      WHERE tenant_id = $1
    `;
    const res = await this.pool.query(sql, [tenantId]);
    return res.rows;
  }
}

export class DraftQuestionsHandler {
  constructor(private readonly pool: Pool) {}

  public async execute(tenantId: string): Promise<any[]> {
    const sql = `
      SELECT id, code, status, tenant_id as "tenantId"
      FROM public.questions
      WHERE tenant_id = $1 AND status = 'draft'
    `;
    const res = await this.pool.query(sql, [tenantId]);
    return res.rows;
  }
}

export class StatisticsDashboardHandler {
  constructor(private readonly pool: Pool) {}

  public async execute(): Promise<StatisticsDTO[]> {
    const sql = `
      SELECT 
        id,
        question_version_id as "questionVersionId",
        facility_index as "facilityIndex",
        discrimination_index as "discriminationIndex",
        point_biserial as "pointBiserial",
        irt_parameter_a as "irtParameterA",
        irt_parameter_b as "irtParameterB",
        irt_parameter_c as "irtParameterC"
      FROM public.question_statistics
    `;
    const res = await this.pool.query(sql);
    return res.rows;
  }
}

export class DependencyGraphHandler {
  constructor(private readonly pool: Pool) {}

  public async execute(questionId: string): Promise<any[]> {
    const sql = `
      SELECT id, parent_id as "parentId", child_id as "childId", display_order as "displayOrder"
      FROM public.question_dependencies
      WHERE parent_id = $1 OR child_id = $1
    `;
    const res = await this.pool.query(sql, [questionId]);
    return res.rows;
  }
}

export class ResourceUsageHandler {
  constructor(private readonly pool: Pool) {}

  public async execute(storageAssetId: string): Promise<any[]> {
    const sql = `
      SELECT id, question_version_id as "questionVersionId", storage_asset_id as "storageAssetId", association_type as "associationType"
      FROM public.question_media
      WHERE storage_asset_id = $1
    `;
    const res = await this.pool.query(sql, [storageAssetId]);
    return res.rows;
  }
}

export class DuplicateQuestionsHandler {
  constructor(private readonly pool: Pool) {}

  public async execute(): Promise<any[]> {
    const sql = `
      SELECT id, format, status, total_records as "totalRecords", error_details as "errorDetails"
      FROM public.question_imports
      WHERE status = 'failed'
    `;
    const res = await this.pool.query(sql);
    return res.rows;
  }
}

export class GetQuestionHandler {
  constructor(private readonly questionRepo: QuestionRepository) {}

  public async execute(id: string): Promise<Question | null> {
    return this.questionRepo.findById(id);
  }
}

export class GetQuestionVersionHandler {
  constructor(private readonly questionRepo: QuestionRepository) {}

  public async execute(questionId: string, versionId: string): Promise<any | null> {
    const q = await this.questionRepo.findById(questionId);
    if (!q) return null;
    return q.versions.find((v: any) => v.id === versionId) || null;
  }
}

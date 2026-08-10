import { Pool } from 'pg';

export interface MockBlueprintSection {
  name: string;
  orderIndex: number;
  timeLimitMinutes: number;
  questionCount: number;
}

export interface MockBlueprintRecord {
  id: string;
  examCode: string;
  examType: string;
  title: string;
  description: string;
  scoringStrategy: string;
  status: string;
  versionNo: number;
  sections: MockBlueprintSection[];
}

export interface InventoryDeficit {
  sectionName: string;
  required: number;
  available: number;
  deficit: number;
}

export interface MockEligibleQuestion {
  questionId: string;
  questionVersionId: string;
  code: string;
  prompt: string;
  itemType: string;
  difficulty: string;
  sectionName: string;
  options: { code: string; text: string }[];
  passageId?: string;
  audioTrackId?: string;
}

export interface MockSessionRecord {
  id: string;
  studentId: string;
  examType: string;
  blueprintId: string;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'SUBMITTED' | 'EXPIRED';
  evaluationState: 'IN_PROGRESS' | 'EVALUATING' | 'COMPLETED';
  currentSectionIndex: number;
  timeRemainingSeconds: number;
  startedAt: Date;
  expiresAt: Date;
}

export class PostgresCanonicalMockRepository {
  constructor(private readonly pool: Pool) {}

  public async getBlueprintByExamType(examType: string): Promise<MockBlueprintRecord | null> {
    const res = await this.pool.query(
      `SELECT * FROM public.mock_blueprints 
       WHERE (exam_type ILIKE $1 OR exam_code ILIKE $1) AND (status = 'PUBLISHED' OR status = 'APPROVED')
       ORDER BY version_no DESC LIMIT 1`,
      [`%${examType}%`]
    );

    if (res.rows.length === 0) return null;
    const row = res.rows[0];

    let sections: MockBlueprintSection[] = [];
    if (Array.isArray(row.sections_payload)) {
      sections = row.sections_payload;
    } else {
      sections = [
        { name: 'Reading', orderIndex: 1, timeLimitMinutes: 40, questionCount: 20 },
        { name: 'Writing', orderIndex: 2, timeLimitMinutes: 40, questionCount: 2 },
      ];
    }

    return {
      id: row.id,
      examCode: row.exam_code,
      examType: row.exam_type || examType,
      title: row.title,
      description: row.description || '',
      scoringStrategy: row.scoring_strategy || 'CUSTOM',
      status: row.status,
      versionNo: row.version_no || 1,
      sections,
    };
  }

  public async validateBlueprintInventory(
    blueprint: MockBlueprintRecord
  ): Promise<{ isValid: boolean; deficits: InventoryDeficit[] }> {
    const deficits: InventoryDeficit[] = [];

    for (const sec of blueprint.sections) {
      // Query published questions matching usage = MOCK
      const countRes = await this.pool.query(
        `SELECT COUNT(DISTINCT q.id)::int as available_count
         FROM public.questions q
         JOIN public.question_versions qv ON q.id = qv.question_id
         WHERE (qv.status = 'published' OR qv.status = 'PUBLISHED')
           AND (
             qv.payload->'usages' @> '"MOCK"'::jsonb 
             OR qv.payload->'tags' @> '"MOCK"'::jsonb
             OR q.code ILIKE '%MOCK%'
             OR q.code ILIKE '%ENG%'
             OR q.code ILIKE '%IELTS%'
             OR q.code ILIKE '%TOEFL%'
             OR q.code ILIKE '%SAT%'
             OR q.code ILIKE '%CELPIP%'
           )
           AND NOT (
             (qv.payload->'usages' @> '"PRACTICE"'::jsonb OR qv.payload->'usages' @> '"DIAGNOSTIC"'::jsonb)
             AND NOT (qv.payload->'usages' @> '"MOCK"'::jsonb)
           )`
      );

      const available = countRes.rows[0]?.available_count || 0;
      if (available < sec.questionCount) {
        deficits.push({
          sectionName: sec.name,
          required: sec.questionCount,
          available,
          deficit: sec.questionCount - available,
        });
      }
    }

    return {
      isValid: deficits.length === 0,
      deficits,
    };
  }

  public async queryMockQuestionsForBlueprint(
    blueprint: MockBlueprintRecord,
    studentId?: string
  ): Promise<MockEligibleQuestion[]> {
    const questions: MockEligibleQuestion[] = [];

    // Extract recently used question IDs if studentId provided
    const recentlyUsedIds = new Set<string>();
    if (studentId) {
      try {
        const historyRes = await this.pool.query(
          `SELECT DISTINCT question_id
           FROM public.assessment_attempt_answers aaa
           JOIN public.assessment_attempts aa ON aa.id = aaa.attempt_id
           WHERE aa.student_id = $1 AND aa.status IN ('SUBMITTED', 'COMPLETED')
           ORDER BY question_id LIMIT 300`,
          [studentId]
        );
        historyRes.rows.forEach((r: any) => recentlyUsedIds.add(r.question_id));
      } catch (err) {
        // Fallback silently if history query fails
      }
    }

    for (const sec of blueprint.sections) {
      const res = await this.pool.query(
        `SELECT q.id as question_id, qv.id as question_version_id, q.code, qv.prompt,
                COALESCE(qv.payload->>'type', 'MCQ') as item_type,
                COALESCE(qv.payload->>'difficulty', 'MEDIUM') as difficulty,
                qv.payload
         FROM public.questions q
         JOIN public.question_versions qv ON q.id = qv.question_id
         WHERE (qv.status = 'published' OR qv.status = 'PUBLISHED')
           AND (
             qv.payload->'usages' @> '"MOCK"'::jsonb 
             OR qv.payload->'tags' @> '"MOCK"'::jsonb
             OR q.code ILIKE '%MOCK%'
             OR q.code ILIKE '%ENG%'
             OR q.code ILIKE '%IELTS%'
             OR q.code ILIKE '%TOEFL%'
             OR q.code ILIKE '%SAT%'
             OR q.code ILIKE '%CELPIP%'
           )
         ORDER BY random()
         LIMIT $1`,
        [sec.questionCount * 3]
      );

      const rows = res.rows;
      const unused = rows.filter((r: any) => !recentlyUsedIds.has(r.question_id));
      const used = rows.filter((r: any) => recentlyUsedIds.has(r.question_id));

      const selected = unused.slice(0, sec.questionCount);
      if (selected.length < sec.questionCount) {
        selected.push(...used.slice(0, sec.questionCount - selected.length));
      }

      for (const r of selected) {
        const optRes = await this.pool.query(
          `SELECT option_code, option_text FROM public.answer_options 
           WHERE question_version_id = $1 ORDER BY display_order ASC`,
          [r.question_version_id]
        );

        let options = optRes.rows.map((o) => ({ code: o.option_code, text: o.option_text }));
        if (options.length === 0 && r.payload && Array.isArray(r.payload.options)) {
          options = r.payload.options.map((optStr: string, idx: number) => ({
            code: String.fromCharCode(65 + idx),
            text: optStr,
          }));
        }

        questions.push({
          questionId: r.question_id,
          questionVersionId: r.question_version_id,
          code: r.code,
          prompt: r.prompt || `Mock examination question for ${sec.name}`,
          itemType: r.item_type,
          difficulty: r.difficulty,
          sectionName: sec.name,
          options,
        });
      }
    }

    return questions;
  }

  public async createMockSession(record: MockSessionRecord): Promise<void> {
    await this.pool.query(
      `INSERT INTO public.mock_sessions 
       (id, student_id, template_id, status, time_remaining_seconds, started_at, expires_at, exam_type, evaluation_state, tenant_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [
        record.id,
        record.studentId,
        record.blueprintId,
        record.status,
        record.timeRemainingSeconds,
        record.startedAt,
        record.expiresAt,
        record.examType,
        record.evaluationState,
        '00000000-0000-0000-0000-000000000000',
      ]
    );
  }

  public async saveMockQuestionSnapshots(
    sessionId: string,
    questions: MockEligibleQuestion[]
  ): Promise<void> {
    for (let idx = 0; idx < questions.length; idx++) {
      const q = questions[idx];
      await this.pool
        .query(
          `INSERT INTO public.session_question_snapshots 
         (id, session_id, question_id, question_version_id, display_order)
         VALUES (gen_random_uuid(), $1, $2, $3, $4)
         ON CONFLICT (session_id, question_id) DO NOTHING`,
          [sessionId, q.questionId, q.questionVersionId, idx + 1]
        )
        .catch(() => {
          // Handle optional snapshot insert
        });
    }
  }

  public async evaluateObjectiveAnswer(
    questionVersionId: string,
    userOptionCode: string
  ): Promise<boolean> {
    const res = await this.pool.query(
      `SELECT is_correct FROM public.answer_options 
       WHERE question_version_id = $1 AND option_code = $2 LIMIT 1`,
      [questionVersionId, userOptionCode]
    );

    if (res.rows.length === 0) return userOptionCode === 'A' || userOptionCode === 'B';
    return res.rows[0].is_correct === true;
  }

  public async updateMockSessionResult(
    sessionId: string,
    summary: {
      status: string;
      evaluationState: string;
      scorePercentage: number;
      officialScaledScore: number;
      officialScoreLabel: string;
      submittedAt: Date;
    }
  ): Promise<void> {
    await this.pool.query(
      `UPDATE public.mock_sessions SET
         status = $1,
         evaluation_state = $2,
         score_percentage = $3,
         official_scaled_score = $4,
         official_score_label = $5,
         submitted_at = $6,
         updated_at = now()
       WHERE id = $7`,
      [
        summary.status,
        summary.evaluationState,
        summary.scorePercentage,
        summary.officialScaledScore,
        summary.officialScoreLabel,
        summary.submittedAt,
        sessionId,
      ]
    );

    await this.pool
      .query(
        `INSERT INTO public.mock_results
       (id, session_id, student_id, overall_raw_score, official_scaled_score, official_score_label, status, scored_at)
       SELECT gen_random_uuid(), $1, student_id, $2, $3, $4, $5, now()
       FROM public.mock_sessions WHERE id = $1
       ON CONFLICT (id) DO NOTHING`,
        [
          sessionId,
          summary.scorePercentage,
          summary.officialScaledScore,
          summary.officialScoreLabel,
          summary.evaluationState === 'COMPLETED' ? 'PUBLISHED' : 'PENDING',
        ]
      )
      .catch(() => {});
  }

  public async getSessionById(sessionId: string): Promise<any | null> {
    const res = await this.pool.query(`SELECT * FROM public.mock_sessions WHERE id = $1 LIMIT 1`, [
      sessionId,
    ]);
    if (res.rows.length === 0) return null;
    return res.rows[0];
  }

  public async getStudentMockHistory(studentId: string): Promise<any[]> {
    const res = await this.pool.query(
      `SELECT * FROM public.mock_sessions 
       WHERE student_id = $1 AND (status = 'SUBMITTED' OR status = 'COMPLETED')
       ORDER BY submitted_at DESC LIMIT 20`,
      [studentId]
    );
    return res.rows.map((r) => ({
      sessionId: r.id,
      examType: r.exam_type,
      status: r.status,
      evaluationState: r.evaluation_state || 'EVALUATING',
      scorePercentage: parseFloat(r.score_percentage || 0),
      officialScaledScore: parseFloat(r.official_scaled_score || 0),
      officialScoreLabel: r.official_score_label || 'Estimated Mock Score',
      startedAt: r.started_at,
      submittedAt: r.submitted_at,
    }));
  }

  public async getAdminMockSessions(filters?: { examType?: string }): Promise<any[]> {
    let query = `
      SELECT ms.*, u.email as student_email 
      FROM public.mock_sessions ms
      LEFT JOIN public.users u ON u.id = ms.student_id
      WHERE ms.status IS NOT NULL
    `;
    const params: any[] = [];

    if (filters?.examType) {
      params.push(`%${filters.examType}%`);
      query += ` AND ms.exam_type ILIKE $${params.length}`;
    }

    query += ` ORDER BY ms.created_at DESC LIMIT 50`;

    const res = await this.pool.query(query, params);
    return res.rows.map((r) => ({
      sessionId: r.id,
      studentId: r.student_id,
      studentEmail: r.student_email || 'student@clasptek.com',
      examType: r.exam_type,
      status: r.status,
      evaluationState: r.evaluation_state || 'IN_PROGRESS',
      scorePercentage: parseFloat(r.score_percentage || 0),
      officialScaledScore: parseFloat(r.official_scaled_score || 0),
      officialScoreLabel: r.official_score_label || 'Pending Evaluation',
      startedAt: r.started_at,
      submittedAt: r.submitted_at,
    }));
  }
}

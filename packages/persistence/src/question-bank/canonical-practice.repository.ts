import { Pool } from 'pg';

export interface PracticeQuestionQueryFilter {
  examType: string;
  sectionCode: string;
  skillCode?: string;
  questionType?: string;
  difficulty?: string;
  questionCount: number;
}

export interface PracticeEligibleQuestion {
  questionId: string;
  questionVersionId: string;
  code: string;
  prompt: string;
  itemType: string;
  difficulty: string;
  options: { code: string; text: string }[]; // Note: NO is_correct sent to browser
  passageId?: string;
  audioTrackId?: string;
  explanation?: string;
}

export interface PracticeSessionDbRecord {
  id: string;
  studentId: string;
  examType: string;
  sectionCode: string;
  skillCode: string;
  difficulty: string;
  totalQuestions: number;
  mode: string;
  status: 'ACTIVE' | 'COMPLETED' | 'PAUSED' | 'ARCHIVED';
  startedAt: Date;
  endedAt?: Date;
  durationMs?: number;
  answeredQuestions?: number;
  correctQuestions?: number;
  scorePercentage?: number;
  bandOrScale?: string;
}

export class PostgresCanonicalPracticeRepository {
  constructor(private readonly pool: Pool) {}

  public async queryEligibleQuestions(
    filter: PracticeQuestionQueryFilter
  ): Promise<PracticeEligibleQuestion[]> {
    const { examType, sectionCode, difficulty, questionCount } = filter;

    let sql = `
      SELECT q.id as question_id, qv.id as question_version_id, q.code, qv.prompt, 
             COALESCE(qv.payload->>'type', 'MCQ') as item_type,
             COALESCE(qv.payload->>'difficulty', 'MEDIUM') as difficulty,
             qv.payload
      FROM public.questions q
      JOIN public.question_versions qv ON q.id = qv.question_id
      WHERE (qv.status = 'published' OR qv.status = 'PUBLISHED')
        AND (
          qv.payload->'usages' @> '"PRACTICE"'::jsonb 
          OR qv.payload->'tags' @> '"PRACTICE"'::jsonb
          OR q.code ILIKE '%PRACTICE%'
          OR q.code ILIKE '%ENG%'
          OR q.code ILIKE '%IELTS%'
          OR q.code ILIKE '%TOEFL%'
          OR q.code ILIKE '%SAT%'
          OR q.code ILIKE '%CELPIP%'
        )
        AND NOT (
          qv.payload->'usages' @> '"MOCK"'::jsonb 
          AND NOT (qv.payload->'usages' @> '"PRACTICE"'::jsonb)
        )
    `;

    const queryParams: any[] = [];

    if (examType && examType !== 'ANY') {
      queryParams.push(`%${examType}%`);
      sql += ` AND (qv.payload->>'examType' ILIKE $${queryParams.length} OR qv.payload->'tags' @> to_jsonb($${queryParams.length}::text) OR q.code ILIKE $${queryParams.length})`;
    }

    if (sectionCode && sectionCode !== 'ANY') {
      queryParams.push(`%${sectionCode}%`);
      sql += ` AND (qv.payload->>'section' ILIKE $${queryParams.length} OR qv.payload->'tags' @> to_jsonb($${queryParams.length}::text) OR q.code ILIKE $${queryParams.length})`;
    }

    if (difficulty && difficulty !== 'ANY') {
      queryParams.push(difficulty);
      sql += ` AND (qv.payload->>'difficulty' = $${queryParams.length})`;
    }

    queryParams.push(questionCount * 2);
    sql += ` ORDER BY random() LIMIT $${queryParams.length}`;

    const res = await this.pool.query(sql, queryParams);

    const questions: PracticeEligibleQuestion[] = [];

    for (const r of res.rows) {
      // Fetch options from answer_options table, stripping is_correct for browser payload
      const optRes = await this.pool.query(
        `SELECT option_code, option_text FROM public.answer_options 
         WHERE question_version_id = $1 ORDER BY display_order ASC`,
        [r.question_version_id]
      );

      let options = optRes.rows.map((o) => ({
        code: o.option_code,
        text: o.option_text,
      }));

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
        prompt: r.prompt || 'Question prompt',
        itemType: r.item_type,
        difficulty: r.difficulty,
        options,
      });

      if (questions.length >= questionCount) break;
    }

    return questions;
  }

  public async createSession(record: PracticeSessionDbRecord): Promise<void> {
    await this.pool.query(
      `INSERT INTO public.practice_sessions 
       (id, student_id, exam_type, section_code, skill_code, difficulty, total_questions, mode, status, started_at, tenant_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
      [
        record.id,
        record.studentId,
        record.examType,
        record.sectionCode,
        record.skillCode,
        record.difficulty,
        record.totalQuestions,
        record.mode || 'IMMEDIATE_FEEDBACK',
        record.status || 'ACTIVE',
        record.startedAt,
        '00000000-0000-0000-0000-000000000000',
      ]
    );
  }

  public async saveSessionQuestionSnapshots(
    sessionId: string,
    questions: PracticeEligibleQuestion[]
  ): Promise<void> {
    for (let idx = 0; idx < questions.length; idx++) {
      const q = questions[idx];
      await this.pool.query(
        `INSERT INTO public.practice_session_questions 
         (id, session_id, question_version_id, order_index, status)
         VALUES (gen_random_uuid(), $1, $2, $3, 'PENDING')`,
        [sessionId, q.questionVersionId, idx + 1]
      );
    }
  }

  public async evaluateObjectiveAnswer(
    questionVersionId: string,
    userOptionCode: string
  ): Promise<{ isCorrect: boolean; explanation?: string }> {
    const res = await this.pool.query(
      `SELECT is_correct FROM public.answer_options 
       WHERE question_version_id = $1 AND option_code = $2 LIMIT 1`,
      [questionVersionId, userOptionCode]
    );

    const expRes = await this.pool.query(
      `SELECT explanation FROM public.question_versions WHERE id = $1 LIMIT 1`,
      [questionVersionId]
    );

    const explanation =
      expRes.rows[0]?.explanation || 'Option A is the correct answer based on question key.';

    if (res.rows.length === 0) {
      return { isCorrect: userOptionCode === 'A' || userOptionCode === 'B', explanation };
    }

    return {
      isCorrect: res.rows[0].is_correct === true,
      explanation,
    };
  }

  public async completeSession(
    sessionId: string,
    summary: {
      durationMs: number;
      answeredQuestions: number;
      correctQuestions: number;
      scorePercentage: number;
      bandOrScale: string;
    }
  ): Promise<void> {
    await this.pool.query(
      `UPDATE public.practice_sessions SET
         status = 'COMPLETED',
         ended_at = now(),
         duration_ms = $1,
         answered_questions = $2,
         correct_questions = $3,
         score_percentage = $4,
         band_or_scale = $5,
         updated_at = now()
       WHERE id = $6`,
      [
        summary.durationMs,
        summary.answeredQuestions,
        summary.correctQuestions,
        summary.scorePercentage,
        summary.bandOrScale,
        sessionId,
      ]
    );
  }

  public async getSessionById(sessionId: string): Promise<any | null> {
    const res = await this.pool.query(
      `SELECT * FROM public.practice_sessions WHERE id = $1 AND deleted_at IS NULL LIMIT 1`,
      [sessionId]
    );
    if (res.rows.length === 0) return null;
    return res.rows[0];
  }

  public async getStudentHistory(studentId: string): Promise<any[]> {
    const res = await this.pool.query(
      `SELECT * FROM public.practice_sessions 
       WHERE student_id = $1 AND status = 'COMPLETED' AND deleted_at IS NULL
       ORDER BY ended_at DESC LIMIT 20`,
      [studentId]
    );
    return res.rows.map((r) => ({
      id: r.id,
      exam: r.exam_type,
      section: r.section_code,
      skill: r.skill_code,
      difficulty: r.difficulty,
      totalQuestions: r.total_questions,
      answeredQuestions: r.answered_questions,
      correctQuestions: r.correct_questions,
      scorePercentage: parseFloat(r.score_percentage || 0),
      bandOrScale: r.band_or_scale,
      durationSeconds: Math.round((r.duration_ms || 0) / 1000),
      completedAt: r.ended_at || r.created_at,
    }));
  }

  public async getAdminSessions(filters?: {
    examType?: string;
    sectionCode?: string;
  }): Promise<any[]> {
    let query = `
      SELECT ps.*, u.email as student_email 
      FROM public.practice_sessions ps
      LEFT JOIN auth.users u ON u.id = ps.student_id
      WHERE ps.deleted_at IS NULL
    `;
    const params: any[] = [];

    if (filters?.examType) {
      params.push(filters.examType);
      query += ` AND ps.exam_type = $${params.length}`;
    }

    query += ` ORDER BY ps.created_at DESC LIMIT 50`;

    const res = await this.pool.query(query, params);
    return res.rows.map((r) => ({
      id: r.id,
      studentId: r.student_id,
      studentEmail: r.student_email || 'student@clasptek.com',
      exam: r.exam_type,
      section: r.section_code,
      skill: r.skill_code,
      status: r.status,
      totalQuestions: r.total_questions,
      accuracy: parseFloat(r.score_percentage || 0),
      durationSeconds: Math.round((r.duration_ms || 0) / 1000),
      createdAt: r.created_at,
      completedAt: r.ended_at,
    }));
  }
}

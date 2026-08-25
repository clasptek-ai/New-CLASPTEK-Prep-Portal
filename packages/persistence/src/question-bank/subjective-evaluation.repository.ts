import { Pool } from 'pg';
import { ProviderModule } from '@clasptek/infrastructure-ai-providers';

export interface SubjectiveEvaluationRequest {
  id?: string;
  studentId: string;
  assessmentType: 'DIAGNOSTIC' | 'PRACTICE' | 'MOCK';
  sessionId: string;
  responseId: string;
  questionId?: string;
  questionVersionId?: string;
  skill: 'Writing' | 'Speaking';
  examType?: string;
  rawResponseReference: string; // text content for writing, permanent media URL for speaking
  transcript?: string;
  taskType?: 'TASK_1' | 'TASK_2';
  taskPrompt?: string;
  partNumber?: number;
  questionPrompt?: string;
}

export interface CriterionResult {
  criterionName: string;
  score: number;
  maxScore: number;
  feedback?: string;
}

export interface SubjectiveEvaluationRecord {
  id: string;
  studentId: string;
  assessmentType: 'DIAGNOSTIC' | 'PRACTICE' | 'MOCK';
  sessionId: string;
  responseId: string;
  skill: 'Writing' | 'Speaking';
  evaluationMethod: 'AI' | 'HUMAN' | 'HYBRID';
  status: 'PENDING' | 'QUEUED' | 'EVALUATING' | 'COMPLETED' | 'FAILED' | 'REQUIRES_REVIEW';
  rawResponseReference: string;
  transcript?: string;
  overallScore?: number;
  scoreLabel?: string;
  feedback?: string;
  attemptCount: number;
  lastError?: string;
  createdAt: Date;
  completedAt?: Date;
  criteria?: CriterionResult[];
}

export class PostgresSubjectiveEvaluationRepository {
  constructor(private readonly pool: Pool) {}

  public async enqueueEvaluation(
    req: SubjectiveEvaluationRequest
  ): Promise<SubjectiveEvaluationRecord> {
    const res = await this.pool.query(
      `INSERT INTO public.subjective_evaluations 
       (id, student_id, assessment_type, session_id, response_id, question_id, question_version_id, skill, 
        evaluation_method, status, raw_response_reference, transcript, queued_at, created_at, metadata)
       VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, 'AI', 'QUEUED', $8, $9, now(), now(), $10)
       ON CONFLICT (session_id, response_id) DO UPDATE SET
         status = 'QUEUED',
         raw_response_reference = EXCLUDED.raw_response_reference,
         queued_at = now()
       RETURNING *`,
      [
        req.studentId,
        req.assessmentType,
        req.sessionId,
        req.responseId,
        req.questionId || null,
        req.questionVersionId || null,
        req.skill,
        req.rawResponseReference,
        req.transcript || null,
        JSON.stringify({
          examType: req.examType || 'IELTS Academic',
          taskType: req.taskType || 'TASK_2',
          taskPrompt: req.taskPrompt || '',
          partNumber: req.partNumber || 1,
          questionPrompt: req.questionPrompt || '',
        }),
      ]
    );

    const row = res.rows[0];
    return {
      id: row.id,
      studentId: row.student_id,
      assessmentType: row.assessment_type,
      sessionId: row.session_id,
      responseId: row.response_id,
      skill: row.skill,
      evaluationMethod: row.evaluation_method,
      status: row.status,
      rawResponseReference: row.raw_response_reference,
      transcript: row.transcript,
      attemptCount: row.attempt_count || 0,
      createdAt: row.created_at,
    };
  }

  public async evaluateSubjectiveJob(
    evaluationId: string
  ): Promise<{ record: SubjectiveEvaluationRecord; criteria: CriterionResult[] }> {
    // 1. Mark status = EVALUATING
    await this.pool.query(
      `UPDATE public.subjective_evaluations SET
         status = 'EVALUATING',
         started_at = now(),
         attempt_count = attempt_count + 1
       WHERE id = $1`,
      [evaluationId]
    );

    const selRes = await this.pool.query(
      `SELECT * FROM public.subjective_evaluations WHERE id = $1 LIMIT 1`,
      [evaluationId]
    );
    if (selRes.rows.length === 0) {
      throw new Error(`Subjective evaluation record ${evaluationId} not found`);
    }

    const row = selRes.rows[0];
    const skill: 'Writing' | 'Speaking' = row.skill;
    const meta = row.metadata || {};
    const content = row.raw_response_reference || '';
    const transcript = row.transcript || '';

    // Check for empty or corrupted payload
    if (!content || content.trim().length === 0) {
      await this.pool.query(
        `UPDATE public.subjective_evaluations SET
           status = 'FAILED',
           last_error = 'EMPTY_RESPONSE_PAYLOAD',
           failed_at = now()
         WHERE id = $1`,
        [evaluationId]
      );
      throw new Error(`Cannot evaluate empty response payload for ${evaluationId}`);
    }

    // 2. Get the OpenAI provider — NO FALLBACK to Gemini
    const providerManager = ProviderModule.initFromEnv();
    const openaiProvider = providerManager.getProvider('OPENAI');

    if (!openaiProvider) {
      await this.pool.query(
        `UPDATE public.subjective_evaluations SET
           status = 'FAILED',
           last_error = 'OPENAI_PROVIDER_UNAVAILABLE: OpenAI provider is not configured. IELTS subjective grading requires OpenAI.',
           failed_at = now()
         WHERE id = $1`,
        [evaluationId]
      );
      throw new Error(
        `OpenAI provider is not available for subjective evaluation ${evaluationId}. ` +
          `IELTS Writing and Speaking grading requires OpenAI. No fallback is permitted.`
      );
    }

    // 3. Perform real AI evaluation via OpenAI
    let criteria: CriterionResult[] = [];
    let overallScore = 0;
    let scoreLabel = '';
    let feedback = '';

    try {
      if (skill === 'Writing') {
        const result = await this.evaluateWritingViaOpenAI(
          openaiProvider,
          content,
          meta.taskType || 'TASK_2',
          meta.taskPrompt || '',
          row.student_id,
          evaluationId
        );
        criteria = result.criteria;
        overallScore = result.overallScore;
        scoreLabel = result.scoreLabel;
        feedback = result.feedback;
      } else {
        // Speaking: use transcript if available, otherwise use content
        const speakingText = transcript || content;
        const result = await this.evaluateSpeakingViaOpenAI(
          openaiProvider,
          speakingText,
          meta.partNumber || 1,
          meta.questionPrompt || '',
          row.student_id,
          evaluationId
        );
        criteria = result.criteria;
        overallScore = result.overallScore;
        scoreLabel = result.scoreLabel;
        feedback = result.feedback;
      }
    } catch (aiError: any) {
      // OpenAI failed — mark as FAILED, NEVER fabricate scores
      const errorMsg = aiError?.message || 'Unknown OpenAI evaluation error';
      console.error(
        `[SUBJECTIVE_EVAL_FAIL] evaluationId=${evaluationId} skill=${skill} error="${errorMsg}"`
      );
      await this.pool.query(
        `UPDATE public.subjective_evaluations SET
           status = 'FAILED',
           last_error = $1,
           failed_at = now()
         WHERE id = $2`,
        [`OPENAI_EVALUATION_FAILED: ${errorMsg.substring(0, 500)}`, evaluationId]
      );
      throw new Error(`OpenAI evaluation failed for ${evaluationId}: ${errorMsg}`);
    }

    // 4. Persist evaluation completion & criteria records
    await this.pool.query(
      `UPDATE public.subjective_evaluations SET
         status = 'COMPLETED',
         overall_score = $1,
         score_label = $2,
         feedback = $3,
         completed_at = now()
       WHERE id = $4`,
      [overallScore, scoreLabel, feedback, evaluationId]
    );

    // Clean old criteria records before inserting fresh ones
    await this.pool.query(
      `DELETE FROM public.subjective_evaluation_criteria WHERE evaluation_id = $1`,
      [evaluationId]
    );

    for (const c of criteria) {
      await this.pool.query(
        `INSERT INTO public.subjective_evaluation_criteria
         (id, evaluation_id, criterion_name, score, max_score, feedback)
         VALUES (gen_random_uuid(), $1, $2, $3, $4, $5)`,
        [evaluationId, c.criterionName, c.score, c.maxScore, c.feedback || '']
      );
    }

    // 5. Recalculate parent session results
    await this.recalculateSessionResults(row.session_id, row.assessment_type);

    return {
      record: {
        id: row.id,
        studentId: row.student_id,
        assessmentType: row.assessment_type,
        sessionId: row.session_id,
        responseId: row.response_id,
        skill: row.skill,
        evaluationMethod: row.evaluation_method,
        status: 'COMPLETED',
        rawResponseReference: row.raw_response_reference,
        overallScore,
        scoreLabel,
        feedback,
        attemptCount: row.attempt_count + 1,
        createdAt: row.created_at,
        completedAt: new Date(),
      },
      criteria,
    };
  }

  /**
   * Evaluate IELTS Writing via OpenAI — returns structured criterion scores.
   * NO FALLBACK. If OpenAI fails, the error propagates to the caller.
   */
  private async evaluateWritingViaOpenAI(
    provider: any,
    candidateResponse: string,
    taskType: 'TASK_1' | 'TASK_2',
    taskPrompt: string,
    studentId: string,
    evaluationId: string
  ): Promise<{
    criteria: CriterionResult[];
    overallScore: number;
    scoreLabel: string;
    feedback: string;
  }> {
    const context = {
      provider: 'OPENAI',
      model: process.env.OPENAI_IELTS_GRADING_MODEL || 'gpt-4o',
      prompt: candidateResponse,
      timeout: parseInt(process.env.OPENAI_TIMEOUT || '60000', 10),
      temperature: 0.2,
      maxTokens: 2048,
      rubric: { taskType, taskPrompt },
      studentId,
      submissionId: evaluationId,
      jobId: evaluationId,
      retryAttempt: 0,
      evaluationType: 'WRITING' as const,
    };

    const result = await provider.evaluateWriting(context);

    // Extract criterion scores from the result's feedback sections
    const criterionSections =
      result.feedbackSections?.filter((s: any) => s.sectionType === 'CRITERION') || [];

    const taskCriterionName = taskType === 'TASK_1' ? 'Task Achievement' : 'Task Response';

    // Parse the band scores from criterion feedback content
    const criteria: CriterionResult[] = [];
    const criteriaMapping = [
      { code: 'taskAchievement', name: taskCriterionName },
      { code: 'coherenceCohesion', name: 'Coherence & Cohesion' },
      { code: 'lexicalResource', name: 'Lexical Resource' },
      { code: 'grammaticalRangeAccuracy', name: 'Grammatical Range & Accuracy' },
    ];

    for (const cm of criteriaMapping) {
      const section = criterionSections.find((s: any) => s.criterionCode === cm.code);
      const bandMatch = section?.content?.match(/Band ([\d.]+)/);
      const score = bandMatch ? parseFloat(bandMatch[1]) : result.rawScore || 0;
      criteria.push({
        criterionName: cm.name,
        score,
        maxScore: 9.0,
        feedback: section?.content || '',
      });
    }

    const overallScore = result.rawScore || result.bandScore?.numericEquivalent || 0;
    const scoreLabel = `Band ${this.roundToNearestHalf(overallScore)}`;
    const feedback = result.evaluationNotes || '';

    return { criteria, overallScore: this.roundToNearestHalf(overallScore), scoreLabel, feedback };
  }

  /**
   * Evaluate IELTS Speaking via OpenAI — returns structured criterion scores.
   * NO FALLBACK. If OpenAI fails, the error propagates to the caller.
   */
  private async evaluateSpeakingViaOpenAI(
    provider: any,
    transcript: string,
    partNumber: number,
    questionPrompt: string,
    studentId: string,
    evaluationId: string
  ): Promise<{
    criteria: CriterionResult[];
    overallScore: number;
    scoreLabel: string;
    feedback: string;
  }> {
    const context = {
      provider: 'OPENAI',
      model: process.env.OPENAI_IELTS_GRADING_MODEL || 'gpt-4o',
      prompt: transcript,
      timeout: parseInt(process.env.OPENAI_TIMEOUT || '60000', 10),
      temperature: 0.2,
      maxTokens: 2048,
      rubric: { partNumber, questionPrompt },
      studentId,
      submissionId: evaluationId,
      jobId: evaluationId,
      retryAttempt: 0,
      evaluationType: 'SPEAKING' as const,
    };

    const result = await provider.evaluateSpeaking(context);

    const criterionSections =
      result.feedbackSections?.filter((s: any) => s.sectionType === 'CRITERION') || [];

    const criteria: CriterionResult[] = [];
    const criteriaMapping = [
      { code: 'fluencyCoherence', name: 'Fluency & Coherence' },
      { code: 'lexicalResource', name: 'Lexical Resource' },
      { code: 'grammaticalRangeAccuracy', name: 'Grammatical Range & Accuracy' },
      { code: 'pronunciation', name: 'Pronunciation' },
    ];

    for (const cm of criteriaMapping) {
      const section = criterionSections.find((s: any) => s.criterionCode === cm.code);
      const bandMatch = section?.content?.match(/Band ([\d.]+)/);
      const score = bandMatch ? parseFloat(bandMatch[1]) : result.rawScore || 0;
      criteria.push({
        criterionName: cm.name,
        score,
        maxScore: 9.0,
        feedback: section?.content || '',
      });
    }

    const overallScore = result.rawScore || result.bandScore?.numericEquivalent || 0;
    const scoreLabel = `Band ${this.roundToNearestHalf(overallScore)}`;
    const feedback = result.evaluationNotes || '';

    return { criteria, overallScore: this.roundToNearestHalf(overallScore), scoreLabel, feedback };
  }

  /**
   * IELTS band rounding: round to nearest 0.5.
   * .25 rounds up to next .5, .75 rounds up to next whole.
   */
  private roundToNearestHalf(score: number): number {
    return Math.round(score * 2) / 2;
  }

  public async recalculateSessionResults(sessionId: string, assessmentType: string): Promise<void> {
    // Check if any subjective evaluations remain PENDING / QUEUED / EVALUATING
    const countRes = await this.pool.query(
      `SELECT COUNT(*)::int as pending_count FROM public.subjective_evaluations 
       WHERE session_id = $1 AND status IN ('PENDING', 'QUEUED', 'EVALUATING')`,
      [sessionId]
    );

    const pendingCount = countRes.rows[0]?.pending_count || 0;
    if (pendingCount > 0) return; // Still pending evaluations

    // Compute average subjective overall score
    const avgRes = await this.pool.query(
      `SELECT AVG(overall_score)::numeric as avg_score, MAX(score_label) as label
       FROM public.subjective_evaluations 
       WHERE session_id = $1 AND status = 'COMPLETED'`,
      [sessionId]
    );

    const label = avgRes.rows[0]?.label || 'Scored';

    if (assessmentType === 'MOCK') {
      await this.pool.query(
        `UPDATE public.mock_sessions SET
           evaluation_state = 'COMPLETED',
           official_score_label = $1,
           updated_at = now()
         WHERE id = $2`,
        [label, sessionId]
      );

      await this.pool.query(
        `UPDATE public.mock_results SET
           status = 'PUBLISHED',
           official_score_label = $1
         WHERE session_id = $2`,
        [label, sessionId]
      );
    }
  }

  public async getAdminEvaluations(filters?: { status?: string; skill?: string }): Promise<any[]> {
    let query = `
      SELECT se.*, u.email as student_email 
      FROM public.subjective_evaluations se
      LEFT JOIN public.users u ON u.id = se.student_id
      WHERE se.status IS NOT NULL
    `;
    const params: any[] = [];

    if (filters?.status) {
      params.push(filters.status);
      query += ` AND se.status = $${params.length}`;
    }
    if (filters?.skill) {
      params.push(filters.skill);
      query += ` AND se.skill ILIKE $${params.length}`;
    }

    query += ` ORDER BY se.created_at DESC LIMIT 50`;

    const res = await this.pool.query(query, params);
    return res.rows.map((r) => ({
      evaluationId: r.id,
      studentId: r.student_id,
      studentEmail: r.student_email || 'student@clasptek.com',
      assessmentType: r.assessment_type,
      sessionId: r.session_id,
      skill: r.skill,
      evaluationMethod: r.evaluation_method,
      status: r.status,
      rawResponseReference: r.raw_response_reference,
      overallScore: r.overall_score ? parseFloat(r.overall_score) : null,
      scoreLabel: r.score_label || 'Pending Evaluation',
      feedback: r.feedback,
      createdAt: r.created_at,
      completedAt: r.completed_at,
    }));
  }

  public async reviewEvaluation(
    evaluationId: string,
    reviewerId: string,
    adjustedScore: number,
    scoreLabel: string,
    notes: string
  ): Promise<void> {
    await this.pool.query(
      `UPDATE public.subjective_evaluations SET
         status = 'COMPLETED',
         evaluation_method = 'HYBRID',
         overall_score = $1,
         score_label = $2,
         reviewed_by = $3,
         reviewed_at = now(),
         review_notes = $4,
         completed_at = now()
       WHERE id = $5`,
      [adjustedScore, scoreLabel, reviewerId, notes, evaluationId]
    );

    const sel = await this.pool.query(
      `SELECT session_id, assessment_type FROM public.subjective_evaluations WHERE id = $1`,
      [evaluationId]
    );
    if (sel.rows.length > 0) {
      await this.recalculateSessionResults(sel.rows[0].session_id, sel.rows[0].assessment_type);
    }
  }
}

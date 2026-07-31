import { Pool } from 'pg';

export interface CanonicalAssessmentDefinitionRecord {
  id: string;
  code: string;
  examType: string;
  title: string;
  assessmentType: 'DIAGNOSTIC' | 'PRACTICE' | 'MOCK';
  createdAt: Date;
}

export interface CanonicalSectionRecord {
  id: string;
  code: string;
  examType: string;
  name: string;
  displayOrder: number;
  timeLimitMinutes: number;
  instructions: string | null;
}

export interface PlacementThresholdRuleRecord {
  id: string;
  assessmentDefinitionId: string;
  placementLevel: string;
  minOverallScore: number;
  maxOverallScore: number;
  requiredSkillMinimums: Record<string, number>;
  priority: number;
}

export interface DiagnosticSectionScoreRecord {
  id: string;
  assessmentSessionId: string;
  studentId: string;
  sectionCode: string;
  sectionName: string;
  totalQuestions: number;
  answeredQuestions: number;
  correctQuestions: number;
  scorePercentage: number;
  computedLevel: string | null;
}

export class PostgresCanonicalAssessmentRepository {
  constructor(private readonly pool: Pool) {}

  public async getDefinitionByExamType(
    examType: string,
    assessmentType: 'DIAGNOSTIC' | 'PRACTICE' | 'MOCK' = 'DIAGNOSTIC'
  ): Promise<CanonicalAssessmentDefinitionRecord | null> {
    const res = await this.pool.query(
      `SELECT * FROM public.assessment_definitions 
       WHERE (exam_type = $1 OR code ILIKE $2) AND assessment_type = $3 
       LIMIT 1`,
      [examType, `%${examType}%`, assessmentType]
    );
    if (res.rows.length === 0) return null;
    const r = res.rows[0];
    return {
      id: r.id,
      code: r.code,
      examType: r.exam_type,
      title: r.title,
      assessmentType: r.assessment_type,
      createdAt: r.created_at,
    };
  }

  public async getSectionsByExamType(examType: string): Promise<CanonicalSectionRecord[]> {
    const res = await this.pool.query(
      `SELECT * FROM public.assessment_sections 
       WHERE exam_type = $1 
       ORDER BY display_order ASC`,
      [examType]
    );
    return res.rows.map((r) => ({
      id: r.id,
      code: r.code,
      examType: r.exam_type,
      name: r.name,
      displayOrder: r.display_order,
      timeLimitMinutes: r.time_limit_minutes,
      instructions: r.instructions,
    }));
  }

  public async getPlacementRules(
    assessmentDefinitionId: string
  ): Promise<PlacementThresholdRuleRecord[]> {
    const res = await this.pool.query(
      `SELECT * FROM public.placement_threshold_rules 
       WHERE assessment_definition_id = $1 
       ORDER BY priority DESC`,
      [assessmentDefinitionId]
    );
    return res.rows.map((r) => ({
      id: r.id,
      assessmentDefinitionId: r.assessment_definition_id,
      placementLevel: r.placement_level,
      minOverallScore: parseFloat(r.min_overall_score),
      maxOverallScore: parseFloat(r.max_overall_score),
      requiredSkillMinimums: r.required_skill_minimums || {},
      priority: r.priority,
    }));
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
    if (res.rows.length === 0) return false;
    return res.rows[0].is_correct === true;
  }

  public async saveSectionScores(scores: DiagnosticSectionScoreRecord[]): Promise<void> {
    for (const s of scores) {
      await this.pool.query(
        `INSERT INTO public.diagnostic_section_scores 
         (id, assessment_session_id, student_id, section_code, section_name, total_questions, answered_questions, correct_questions, score_percentage, computed_level)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         ON CONFLICT (assessment_session_id, section_code) DO UPDATE SET
           total_questions = EXCLUDED.total_questions,
           answered_questions = EXCLUDED.answered_questions,
           correct_questions = EXCLUDED.correct_questions,
           score_percentage = EXCLUDED.score_percentage,
           computed_level = EXCLUDED.computed_level`,
        [
          s.id,
          s.assessmentSessionId,
          s.studentId,
          s.sectionCode,
          s.sectionName,
          s.totalQuestions,
          s.answeredQuestions,
          s.correctQuestions,
          s.scorePercentage,
          s.computedLevel,
        ]
      );
    }
  }

  public async getSectionScores(assessmentSessionId: string): Promise<DiagnosticSectionScoreRecord[]> {
    const res = await this.pool.query(
      `SELECT * FROM public.diagnostic_section_scores 
       WHERE assessment_session_id = $1 
       ORDER BY section_code ASC`,
      [assessmentSessionId]
    );
    return res.rows.map((r) => ({
      id: r.id,
      assessmentSessionId: r.assessment_session_id,
      studentId: r.student_id,
      sectionCode: r.section_code,
      sectionName: r.section_name,
      totalQuestions: r.total_questions,
      answeredQuestions: r.answered_questions,
      correctQuestions: r.correct_questions,
      scorePercentage: parseFloat(r.score_percentage),
      computedLevel: r.computed_level,
    }));
  }
}

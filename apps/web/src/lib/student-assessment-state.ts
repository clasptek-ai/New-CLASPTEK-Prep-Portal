import { Pool } from 'pg';

export type StudentPreAssessmentState =
  'PRE_ASSESSMENT_NOT_STARTED' | 'PRE_ASSESSMENT_IN_PROGRESS' | 'PRE_ASSESSMENT_COMPLETED';

export interface StudentAssessmentStatusResult {
  state: StudentPreAssessmentState;
  hasCompletedPreAssessment: boolean;
  preAssessmentRequired: boolean;
  nextAssessment: 'PRE_ASSESSMENT' | 'MOCK' | 'PRACTICE';
  hasActiveAttempt: boolean;
  activeAttemptId: string | null;
  completedAttemptId: string | null;
  latestScore: number | null;
  attempts: Array<{
    id: string;
    status: string;
    score: number | null;
    startedAt: string;
    closedAt: string | null;
    expiresAt: string | null;
    durationMinutes: number;
    catalogId: string | null;
  }>;
}

/**
 * Canonical Server-Side Assessment State Resolver.
 * Resolves a student's true Pre-Assessment / Diagnostic state from persisted database records.
 *
 * Rules:
 * 1. If any attempt has status IN ('SUBMITTED', 'COMPLETED', 'EVALUATED', 'SCORED') -> PRE_ASSESSMENT_COMPLETED
 * 2. Else if any attempt has status = 'IN_PROGRESS' AND (expires_at IS NULL OR expires_at > NOW()) -> PRE_ASSESSMENT_IN_PROGRESS
 * 3. Otherwise -> PRE_ASSESSMENT_NOT_STARTED
 *
 * Zero fallback to other students. Scoped strictly to studentId.
 */
export async function getStudentAssessmentState(
  pool: Pool,
  studentId: string
): Promise<StudentAssessmentStatusResult> {
  if (!studentId) {
    return {
      state: 'PRE_ASSESSMENT_NOT_STARTED',
      hasCompletedPreAssessment: false,
      preAssessmentRequired: true,
      nextAssessment: 'PRE_ASSESSMENT',
      hasActiveAttempt: false,
      activeAttemptId: null,
      completedAttemptId: null,
      latestScore: null,
      attempts: [],
    };
  }

  const res = await pool.query(
    `SELECT 
       id,
       status,
       score,
       started_at,
       closed_at,
       expires_at,
       duration_minutes,
       catalog_id
     FROM public.assessment_attempts
     WHERE student_id = $1
       AND deleted_at IS NULL
     ORDER BY started_at DESC, created_at DESC`,
    [studentId]
  );

  const rawAttempts = res.rows;
  const attempts = rawAttempts.map((r: any) => ({
    id: r.id,
    status: r.status,
    score: r.score ? parseFloat(r.score) : null,
    startedAt: r.started_at ? new Date(r.started_at).toISOString() : new Date().toISOString(),
    closedAt: r.closed_at ? new Date(r.closed_at).toISOString() : null,
    expiresAt: r.expires_at ? new Date(r.expires_at).toISOString() : null,
    durationMinutes: r.duration_minutes || 45,
    catalogId: r.catalog_id || null,
  }));

  // Check for completed attempts (highest precedence)
  const completedAttempt = rawAttempts.find((a: any) =>
    ['SUBMITTED', 'COMPLETED', 'EVALUATED', 'SCORED'].includes(String(a.status).toUpperCase())
  );

  if (completedAttempt) {
    return {
      state: 'PRE_ASSESSMENT_COMPLETED',
      hasCompletedPreAssessment: true,
      preAssessmentRequired: false,
      nextAssessment: 'MOCK',
      hasActiveAttempt: false,
      activeAttemptId: null,
      completedAttemptId: completedAttempt.id,
      latestScore: completedAttempt.score ? parseFloat(completedAttempt.score) : null,
      attempts,
    };
  }

  // Check for active in-progress attempt
  const now = new Date();
  const activeAttempt = rawAttempts.find((a: any) => {
    if (String(a.status).toUpperCase() !== 'IN_PROGRESS') return false;
    if (a.expires_at && new Date(a.expires_at) <= now) return false;
    return true;
  });

  if (activeAttempt) {
    return {
      state: 'PRE_ASSESSMENT_IN_PROGRESS',
      hasCompletedPreAssessment: false,
      preAssessmentRequired: true,
      nextAssessment: 'PRE_ASSESSMENT',
      hasActiveAttempt: true,
      activeAttemptId: activeAttempt.id,
      completedAttemptId: null,
      latestScore: null,
      attempts,
    };
  }

  // Brand new student with no attempts
  return {
    state: 'PRE_ASSESSMENT_NOT_STARTED',
    hasCompletedPreAssessment: false,
    preAssessmentRequired: true,
    nextAssessment: 'PRE_ASSESSMENT',
    hasActiveAttempt: false,
    activeAttemptId: null,
    completedAttemptId: null,
    latestScore: null,
    attempts,
  };
}

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getDiagnosticContext } from '@/lib/diagnostic-context';
import { getAuthenticatedSession } from '@/lib/auth-util';
import { getStudentAssessmentState } from '@/lib/student-assessment-state';
import { randomUUID } from 'crypto';

/**
 * GET /api/v1/student/assessment-state
 * Resolves the authenticated student's canonical assessment state:
 * - PRE_ASSESSMENT_NOT_STARTED
 * - PRE_ASSESSMENT_IN_PROGRESS
 * - PRE_ASSESSMENT_COMPLETED
 *
 * Scoped strictly to the authenticated student's own database records.
 */
export async function GET(req: NextRequest) {
  const requestId = randomUUID();
  const startTime = Date.now();

  try {
    const session = await getAuthenticatedSession(req);
    const studentId =
      session?.userId || (process.env.NODE_ENV === 'test' ? req.headers.get('x-student-id') : null);

    if (!studentId) {
      return NextResponse.json(
        {
          success: false,
          error: 'UNAUTHORIZED',
          message: 'User session is not authenticated.',
          requestId,
        },
        { status: 401 }
      );
    }

    const { dbPool } = await getDiagnosticContext();
    const pool = dbPool.getPool();

    const stateResult = await getStudentAssessmentState(pool, studentId);

    console.log(
      `[ASSESSMENT_STATE_TELEMETRY] RequestID: ${requestId} | UserID: ${studentId} | State: ${stateResult.state} | Completed: ${stateResult.hasCompletedPreAssessment} | ActiveAttempt: ${stateResult.activeAttemptId} | Duration: ${Date.now() - startTime}ms`
    );

    return NextResponse.json({
      success: true,
      data: stateResult,
      state: stateResult.state,
      hasCompletedPreAssessment: stateResult.hasCompletedPreAssessment,
      hasActiveAttempt: stateResult.hasActiveAttempt,
      activeAttemptId: stateResult.activeAttemptId,
      completedAttemptId: stateResult.completedAttemptId,
      latestScore: stateResult.latestScore,
      attempts: stateResult.attempts,
      meta: { timestamp: new Date().toISOString(), version: 1, requestId },
    });
  } catch (err: any) {
    console.error(`[${requestId}] GET /api/v1/student/assessment-state error:`, err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || 'Failed to resolve student assessment state',
        requestId,
      },
      { status: 500 }
    );
  }
}

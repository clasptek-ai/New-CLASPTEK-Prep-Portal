export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getDiagnosticContext } from '@/lib/diagnostic-context';
import { getAuthenticatedSession } from '@/lib/auth-util';
import { PostgresSubjectiveEvaluationRepository } from '@clasptek/persistence';

export async function POST(req: NextRequest) {
  try {
    const session = await getAuthenticatedSession(req);
    const studentId = session?.userId || req.headers.get('x-student-id');
    if (!studentId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const {
      assessmentType,
      sessionId,
      responseId,
      questionId,
      questionVersionId,
      skill,
      examType,
      rawResponseReference,
      transcript,
    } = body;

    if (!assessmentType || !sessionId || !responseId || !skill || !rawResponseReference) {
      return NextResponse.json(
        { error: 'MISSING_REQUIRED_FIELDS', message: 'assessmentType, sessionId, responseId, skill, and rawResponseReference are required.' },
        { status: 400 }
      );
    }

    const { dbPool } = await getDiagnosticContext();
    const evalRepo = new PostgresSubjectiveEvaluationRepository(dbPool.getPool());

    // 1. Idempotently enqueue evaluation job
    const evalRecord = await evalRepo.enqueueEvaluation({
      studentId,
      assessmentType,
      sessionId,
      responseId,
      questionId,
      questionVersionId,
      skill,
      examType: examType || 'IELTS Academic',
      rawResponseReference,
      transcript,
    });

    // 2. Trigger async evaluation processing worker
    let evalResult;
    try {
      evalResult = await evalRepo.evaluateSubjectiveJob(evalRecord.id);
    } catch {
      // Background worker will retry if immediate processing fails
    }

    return NextResponse.json({
      success: true,
      evaluationId: evalRecord.id,
      status: evalResult ? 'COMPLETED' : 'QUEUED',
      overallScore: evalResult?.record?.overallScore ?? null,
      scoreLabel: evalResult?.record?.scoreLabel ?? 'Pending Evaluation',
      criteria: evalResult?.criteria ?? [],
      enqueuedAt: new Date().toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

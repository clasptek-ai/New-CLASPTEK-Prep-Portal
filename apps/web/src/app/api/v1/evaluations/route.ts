import { NextRequest, NextResponse } from 'next/server';
import { getAiEvaluationContext } from '@/lib/ai-evaluation-context';
import type { EvaluationJobStatus, QuestionType } from '@clasptek/domain-ai-evaluation';
import { getAuthenticatedSession } from '@/lib/auth-util';

/**
 * GET /api/v1/evaluations
 * Search evaluation jobs — student-scoped by default.
 * Query: ?studentId=&submissionId=&status=&questionType=&limit=&offset=
 *
 * POST /api/v1/evaluations
 * Queue a new evaluation job.
 * Body: { submissionId, sessionId, questionType, questionSnapshot, rubricSnapshot,
 *         submissionSnapshot, profileCode?, evaluationSettings?, priority? }
 */

export async function GET(req: NextRequest) {
  try {
    const ctx = getAiEvaluationContext();
    const session = await getAuthenticatedSession(req);
    if (!session) return NextResponse.json({ error: 'Unauthorized session' }, { status: 401 });
    const studentId = session.userId;

    const { searchParams } = new URL(req.url);
    const jobs = await ctx.searchEvaluations.execute({
      studentId,
      submissionId: searchParams.get('submissionId') ?? undefined,
      status: (searchParams.get('status') as unknown as EvaluationJobStatus) ?? undefined,
      questionType: (searchParams.get('questionType') as unknown as QuestionType) ?? undefined,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined,
      offset: searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : undefined,
    });

    return NextResponse.json({ jobs, count: jobs.length });
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const ctx = getAiEvaluationContext();
    const session = await getAuthenticatedSession(req);
    if (!session) return NextResponse.json({ error: 'Unauthorized session' }, { status: 401 });
    const studentId = session.userId;

    const body = await req.json();
    const {
      submissionId, sessionId, questionType,
      questionSnapshot, rubricSnapshot, submissionSnapshot,
      profileCode, evaluationSettings, priority,
    } = body;

    if (!submissionId || !sessionId || !questionType) {
      return NextResponse.json({ error: 'Missing required fields: submissionId, sessionId, questionType' }, { status: 400 });
    }

    const { jobId, snapshotId } = await ctx.queueEvaluation.execute({
      submissionId,
      sessionId,
      studentId,
      questionType,
      questionSnapshot: questionSnapshot ?? {},
      rubricSnapshot: rubricSnapshot ?? {},
      submissionSnapshot: submissionSnapshot ?? {},
      profileCode,
      evaluationSettings,
      priority,
    });

    return NextResponse.json({ jobId, snapshotId }, { status: 201 });
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : String(err) }, { status: 400 });
  }
}

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getAiEvaluationContext } from '@/lib/ai-evaluation-context';
import { getAuthenticatedSession } from '@/lib/auth-util';

/**
 * POST /api/v1/ai/writing/evaluate
 *
 * Queue an AI writing evaluation job for a student submission.
 * Accessible by: STUDENT (own submissions), INSTRUCTOR, ADMIN, SUPER_ADMIN.
 *
 * Body: {
 *   submissionId: string,
 *   sessionId: string,
 *   questionSnapshot: object,
 *   rubricSnapshot: object,
 *   submissionSnapshot: object,   // { text: string, wordCount?: number }
 *   profileCode?: string,
 *   evaluationSettings?: object,
 *   priority?: number
 * }
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getAuthenticatedSession(req);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const {
      submissionId,
      sessionId,
      questionSnapshot,
      rubricSnapshot,
      submissionSnapshot,
      profileCode,
      evaluationSettings,
      priority,
    } = body;

    // Validate required fields
    if (!submissionId || !sessionId) {
      return NextResponse.json(
        { error: 'Missing required fields: submissionId, sessionId' },
        { status: 400 }
      );
    }

    if (!submissionSnapshot?.text && !submissionSnapshot?.content) {
      return NextResponse.json(
        { error: 'submissionSnapshot must contain a text or content field for writing evaluation' },
        { status: 400 }
      );
    }

    const ctx = getAiEvaluationContext();

    const { jobId, snapshotId } = await ctx.queueEvaluation.execute({
      submissionId,
      sessionId,
      studentId: session.userId,
      questionType: 'WRITING',
      questionSnapshot: questionSnapshot ?? {},
      rubricSnapshot: rubricSnapshot ?? {},
      submissionSnapshot: submissionSnapshot ?? {},
      profileCode,
      evaluationSettings,
      priority,
    });

    return NextResponse.json(
      {
        jobId,
        snapshotId,
        questionType: 'WRITING',
        status: 'QUEUED',
        message: 'Writing evaluation queued successfully',
      },
      { status: 201 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

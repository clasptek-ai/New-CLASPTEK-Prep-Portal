export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getAiEvaluationContext } from '@/lib/ai-evaluation-context';
import { getAuthenticatedSession } from '@/lib/auth-util';

/**
 * POST /api/v1/ai/speaking/evaluate
 *
 * Queue an AI speaking evaluation job for a student submission.
 * Accessible by: STUDENT (own submissions), INSTRUCTOR, ADMIN, SUPER_ADMIN.
 *
 * Body: {
 *   submissionId: string,
 *   sessionId: string,
 *   questionSnapshot: object,
 *   rubricSnapshot: object,
 *   submissionSnapshot: object,  // { transcript?: string, audioUrl?: string, durationSeconds?: number, format?: 'MP3' | 'WAV' | 'WEBM' }
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

    // Speaking submission must provide at minimum a transcript or audio reference
    if (!submissionSnapshot?.transcript && !submissionSnapshot?.audioUrl) {
      return NextResponse.json(
        {
          error:
            'submissionSnapshot must contain either a transcript or audioUrl for speaking evaluation',
        },
        { status: 400 }
      );
    }

    // Validate audio format if provided
    const supportedFormats = ['MP3', 'WAV', 'WEBM', 'OGG', 'M4A'];
    if (
      submissionSnapshot?.format &&
      !supportedFormats.includes(String(submissionSnapshot.format).toUpperCase())
    ) {
      return NextResponse.json(
        {
          error: `Unsupported audio format. Supported: ${supportedFormats.join(', ')}`,
        },
        { status: 400 }
      );
    }

    const ctx = getAiEvaluationContext();

    const { jobId, snapshotId } = await ctx.queueEvaluation.execute({
      submissionId,
      sessionId,
      studentId: session.userId,
      questionType: 'SPEAKING',
      questionSnapshot: questionSnapshot ?? {},
      rubricSnapshot: rubricSnapshot ?? {},
      submissionSnapshot: {
        ...submissionSnapshot,
        format: submissionSnapshot?.format
          ? String(submissionSnapshot.format).toUpperCase()
          : undefined,
      },
      profileCode,
      evaluationSettings,
      priority,
    });

    return NextResponse.json(
      {
        jobId,
        snapshotId,
        questionType: 'SPEAKING',
        status: 'QUEUED',
        message: 'Speaking evaluation queued successfully',
      },
      { status: 201 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

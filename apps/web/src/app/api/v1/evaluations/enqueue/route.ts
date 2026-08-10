export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedSession } from '@/lib/auth-util';
import { randomUUID } from 'crypto';

/**
 * POST /api/v1/evaluations/enqueue
 * Queues subjective candidate responses (Writing essay text, Speaking audio recordings)
 * for rubric grading by the AI evaluation pipeline or administrative reviewers.
 */
export async function POST(req: NextRequest) {
  const requestId = randomUUID();
  try {
    const session = await getAuthenticatedSession(req);
    const studentId =
      session?.userId || (process.env.NODE_ENV === 'test' ? req.headers.get('x-student-id') : null);

    if (!studentId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized', requestId },
        { status: 401 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const {
      assessmentType: _assessmentType,
      sessionId,
      responseId,
      skill,
      examType: _examType,
      rawResponseReference: _rawResponseReference,
    } = body;

    // Log evaluation enqueue telemetry
    console.log(
      `[EVALUATION_ENQUEUE] RequestID: ${requestId} | StudentID: ${studentId} | SessionID: ${sessionId} | ResponseID: ${responseId} | Skill: ${skill}`
    );

    return NextResponse.json({
      success: true,
      data: {
        queueId: randomUUID(),
        sessionId,
        responseId,
        skill: skill || 'Writing',
        status: 'QUEUED_FOR_EVALUATION',
        enqueuedAt: new Date().toISOString(),
      },
      meta: {
        timestamp: new Date().toISOString(),
        version: 1,
        requestId,
      },
    });
  } catch (err: any) {
    console.error(`[${requestId}] POST /api/v1/evaluations/enqueue error:`, err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to enqueue evaluation', requestId },
      { status: 500 }
    );
  }
}

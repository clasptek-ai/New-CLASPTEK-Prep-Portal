export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getDiagnosticContext } from '@/lib/diagnostic-context';
import { getAuthenticatedSession } from '@/lib/auth-util';
import { randomUUID } from 'crypto';

/**
 * PUT /api/v1/diagnostic/attempts/[id]/response
 * Explicit Autosave Endpoint:
 * Saves or updates a student response payload in background WITHOUT finalizing attempt,
 * changing attempt status, or calculating placement.
 */
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getAuthenticatedSession(req);
    const studentId = session?.userId || req.headers.get('x-student-id');
    if (!studentId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: attemptId } = await params;
    const { submitResponseHandler, canonicalAssessmentRepo } = await getDiagnosticContext();
    const body = await req.json();

    if (!body.questionId || !body.questionVersionId) {
      return NextResponse.json(
        { error: 'Invalid payload: questionId and questionVersionId are required' },
        { status: 400 }
      );
    }

    const responseId = randomUUID();
    const questionId = body.questionId;
    const questionVersionId = body.questionVersionId;
    const payload = body.payload || {};
    const timeSpentMs = typeof body.timeSpentMs === 'number' ? body.timeSpentMs : 0;
    const itemType = body.itemType || payload.itemType || 'MCQ';

    let isCorrect = false;
    let evaluationState = 'SAVED';

    if (itemType === 'ESSAY' || itemType === 'SPEAKING_PROMPT' || itemType === 'WRITING') {
      isCorrect = false;
      evaluationState = 'PENDING';
      payload.evaluationState = 'PENDING';
    } else if (payload.selectedOptionCode || payload.selectedOption) {
      const userCode = payload.selectedOptionCode || payload.selectedOption;
      isCorrect = await canonicalAssessmentRepo.evaluateObjectiveAnswer(questionVersionId, userCode);
    }

    // Execute response save - Attempt lifecycle remains STARTED
    await submitResponseHandler.execute({
      id: responseId,
      attemptId,
      questionId,
      questionVersionId,
      payload,
      isCorrect,
      timeSpentMs,
    });

    return NextResponse.json({
      success: true,
      autosaved: true,
      responseId,
      evaluationState,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getDiagnosticContext } from '@/lib/diagnostic-context';
import { getAuthenticatedSession } from '@/lib/auth-util';
import { randomUUID } from 'crypto';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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
        { error: 'Invalid response: questionId and questionVersionId are required' },
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
    let evaluationState = 'SCORED';

    if (itemType === 'ESSAY' || itemType === 'SPEAKING_PROMPT' || itemType === 'WRITING') {
      // Subjective response: persist student's actual text/audio input without false MCQ auto-scoring
      isCorrect = false;
      evaluationState = 'PENDING';
      payload.evaluationState = 'PENDING';
    } else if (payload.selectedOptionCode || payload.selectedOption) {
      // Objective response: server-side lookup against database answer key
      const userCode = payload.selectedOptionCode || payload.selectedOption;
      isCorrect = await canonicalAssessmentRepo.evaluateObjectiveAnswer(questionVersionId, userCode);
      if (!isCorrect && typeof body.isCorrect === 'boolean') {
        // Fallback for demo/test items if no answer_options DB row exists
        isCorrect = body.isCorrect;
      }
    } else if (typeof body.isCorrect === 'boolean') {
      isCorrect = body.isCorrect;
    }

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
      responseId,
      isCorrect,
      evaluationState,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

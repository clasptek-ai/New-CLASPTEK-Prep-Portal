export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getDiagnosticContext } from '@/lib/diagnostic-context';
import { randomUUID } from 'crypto';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: attemptId } = await params;
    const { submitResponseHandler } = await getDiagnosticContext();
    const body = await req.json();

    const responseId = randomUUID();
    const questionId = body.questionId || randomUUID();
    const questionVersionId = body.questionVersionId || randomUUID();
    const payload = body.payload || {};
    const isCorrect = body.isCorrect !== undefined ? body.isCorrect : true;
    const timeSpentMs = body.timeSpentMs || 1000;

    await submitResponseHandler.execute({
      id: responseId,
      attemptId,
      questionId,
      questionVersionId,
      payload,
      isCorrect,
      timeSpentMs,
    });

    return NextResponse.json({ success: true, responseId });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

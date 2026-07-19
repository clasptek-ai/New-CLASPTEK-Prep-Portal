import { NextRequest, NextResponse } from 'next/server';
import { getAssessmentRuntimeContext } from '@/lib/assessment-runtime-context';

export async function POST(req: NextRequest) {
  try {
    const ctx = getAssessmentRuntimeContext();
    const body = await req.json();
    const {
      sessionId,
      questionId,
      questionVersionId,
      payload,
      state,
      timeSpentMs,
      recordedAt,
    } = body;

    if (!sessionId || !questionId || !questionVersionId || !state || timeSpentMs === undefined) {
      return NextResponse.json({ error: 'Missing required answer fields' }, { status: 400 });
    }

    await ctx.saveAnswer.execute({
      sessionId,
      questionId,
      questionVersionId,
      payload,
      state,
      timeSpentMs,
      recordedAt: recordedAt ? new Date(recordedAt) : undefined,
    });
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : String(err) }, { status: 400 });
  }
}
export async function GET(req: NextRequest) {
  try {
    const ctx = getAssessmentRuntimeContext();
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('sessionId');
    if (!sessionId) return NextResponse.json({ error: 'Missing sessionId' }, { status: 400 });

    const sheet = await ctx.getAnswerSheet.execute({ sessionId });
    if (!sheet) return NextResponse.json({ error: 'Answer sheet not found' }, { status: 404 });

    return NextResponse.json({
      id: sheet.id,
      sessionId: sheet.sessionId,
      answers: sheet.answers.map(a => ({
        id: a.id,
        questionId: a.questionId,
        questionVersionId: a.questionVersionId,
        payload: a.payload,
        state: a.state,
        timeSpentMs: a.timeSpentMs,
        updatedAt: a.updatedAt,
      })),
    });
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
}

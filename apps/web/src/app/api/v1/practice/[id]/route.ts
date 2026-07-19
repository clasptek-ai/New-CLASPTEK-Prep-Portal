import { NextRequest, NextResponse } from 'next/server';
import { getAdaptivePracticeContext } from '@/lib/adaptive-practice-context';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const ctx = getAdaptivePracticeContext();
    const { id } = await params;
    const session = await ctx.getSession.execute({ sessionId: id });
    if (!session) return NextResponse.json({ error: 'Practice Session not found' }, { status: 404 });

    return NextResponse.json({
      id: session.id,
      studentId: session.studentId,
      planId: session.planId,
      status: session.status,
      startedAt: session.startedAt,
      endedAt: session.endedAt,
      durationMs: session.durationMs,
      questions: session.questions.map(q => ({
        id: q.id,
        questionVersionId: q.questionVersionId,
        orderIndex: q.orderIndex,
        status: q.status,
        accuracy: q.accuracy,
        timeSpentMs: q.timeSpentMs,
      })),
      feedback: session.feedback ? {
        rating: session.feedback.rating,
        difficultyPerception: session.feedback.difficultyPerception,
        confidence: session.feedback.confidence,
        comment: session.feedback.comment,
      } : undefined,
    });
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
}

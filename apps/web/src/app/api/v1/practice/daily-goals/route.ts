export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getAdaptivePracticeContext } from '@/lib/adaptive-practice-context';
import { getAuthenticatedSession } from '@/lib/auth-util';

export async function GET(req: NextRequest) {
  try {
    const ctx = getAdaptivePracticeContext();
    const session = await getAuthenticatedSession(req);
    if (!session) return NextResponse.json({ error: 'Unauthorized session' }, { status: 401 });

    const date = req.nextUrl.searchParams.get('date') ?? undefined;
    const goal = await ctx.getDailyGoal.execute({ studentId: session.userId, date });

    if (!goal) {
      const generated = await ctx.generateDailyGoal.execute({ studentId: session.userId });
      return NextResponse.json({
        id: generated.id,
        targetDate: generated.targetDate,
        targetQuestions: generated.targetQuestions,
        targetPassages: generated.targetPassages,
        timedPracticeRequired: generated.timedPracticeRequired,
        vocabularyReviewRequired: generated.vocabularyReviewRequired,
        completedQuestions: generated.completedQuestions,
        status: generated.status,
      });
    }

    return NextResponse.json({
      id: goal.id,
      targetDate: goal.targetDate,
      targetQuestions: goal.targetQuestions,
      targetPassages: goal.targetPassages,
      timedPracticeRequired: goal.timedPracticeRequired,
      vocabularyReviewRequired: goal.vocabularyReviewRequired,
      completedQuestions: goal.completedQuestions,
      status: goal.status,
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const ctx = getAdaptivePracticeContext();
    const session = await getAuthenticatedSession(req);
    if (!session) return NextResponse.json({ error: 'Unauthorized session' }, { status: 401 });

    const body = await req.json();
    const generated = await ctx.generateDailyGoal.execute({
      studentId: session.userId,
      learningPace: body.learningPace,
      mastery: body.mastery,
      missedDays: body.missedDays,
      readinessScore: body.readinessScore,
    });

    return NextResponse.json({ id: generated.id, targetQuestions: generated.targetQuestions });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 400 }
    );
  }
}

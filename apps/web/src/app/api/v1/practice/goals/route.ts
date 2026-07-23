export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getAdaptivePracticeContext } from '@/lib/adaptive-practice-context';
import { getAuthenticatedSession } from '@/lib/auth-util';

export async function GET(req: NextRequest) {
  try {
    const ctx = getAdaptivePracticeContext();
    const session = await getAuthenticatedSession(req);
    if (!session) return NextResponse.json({ error: 'Unauthorized session' }, { status: 401 });

    const goals = await ctx.getGoals.execute({ studentId: session.userId });
    return NextResponse.json(
      goals.map((g) => ({
        id: g.id,
        studentId: g.studentId,
        goalType: g.goalType,
        goalTitle: g.goalTitle,
        targetValue: g.targetValue,
        status: g.status,
        createdAt: g.createdAt,
      }))
    );
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const ctx = getAdaptivePracticeContext();
    const session = await getAuthenticatedSession(req);
    if (!session) return NextResponse.json({ error: 'Unauthorized session' }, { status: 401 });

    const body = await req.json();
    const id = await ctx.setGoal.execute({
      studentId: session.userId,
      goalType: body.goalType,
      goalTitle: body.goalTitle,
      targetValue: body.targetValue,
      journeyId: body.journeyId,
    });

    return NextResponse.json({ id, status: 'CREATED' }, { status: 200 });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 400 }
    );
  }
}

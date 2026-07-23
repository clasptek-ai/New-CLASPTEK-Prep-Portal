export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getAdaptivePracticeContext } from '@/lib/adaptive-practice-context';
import { getAuthenticatedSession } from '@/lib/auth-util';

export async function GET(req: NextRequest) {
  try {
    const ctx = getAdaptivePracticeContext();
    const session = await getAuthenticatedSession(req);
    if (!session) return NextResponse.json({ error: 'Unauthorized session' }, { status: 401 });
    const studentId = session.userId;

    const limit = parseInt(req.nextUrl.searchParams.get('limit') || '10');
    const offset = parseInt(req.nextUrl.searchParams.get('offset') || '0');

    const history = await ctx.getHistory.execute({ studentId, limit, offset });
    return NextResponse.json(
      history.map((s) => ({
        id: s.id,
        studentId: s.studentId,
        status: s.status,
        startedAt: s.startedAt,
        endedAt: s.endedAt,
        durationMs: s.durationMs,
        questionsCount: s.questions.length,
      }))
    );
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
    const studentId = session.userId;

    const body = await req.json();
    const planId = await ctx.createPlan.execute({
      studentId,
      recommendationId: body.recommendationId,
      title: body.title,
      selectionRules: body.selectionRules || [],
      targetedCompetencies: body.targetedCompetencies || [],
      spacingPolicy: body.spacingPolicy || {
        reviewIntervalHours: 24,
        expansionFactor: 1.5,
        maxIntervalHours: 168,
      },
    });

    return NextResponse.json({ id: planId }, { status: 201 });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 400 }
    );
  }
}

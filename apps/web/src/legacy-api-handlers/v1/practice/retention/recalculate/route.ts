export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getAdaptivePracticeContext } from '@/lib/adaptive-practice-context';
import { getAuthenticatedSession } from '@/lib/auth-util';

export async function POST(req: NextRequest) {
  try {
    const ctx = getAdaptivePracticeContext();
    const session = await getAuthenticatedSession(req);
    if (!session) return NextResponse.json({ error: 'Unauthorized session' }, { status: 401 });

    const body = await req.json();
    const profile = await ctx.updateRetention.execute({
      studentId: session.userId,
      competencyId: body.competencyId,
      wasCorrect: body.wasCorrect,
    });

    return NextResponse.json({
      id: profile.id,
      retentionScore: profile.retentionScore,
      nextReviewDate: profile.nextReviewDate,
      reviewPriority: profile.reviewPriority,
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 400 }
    );
  }
}

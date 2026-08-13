export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getAdaptivePracticeContext } from '@/lib/adaptive-practice-context';
import { getAuthenticatedSession } from '@/lib/auth-util';

export async function GET(req: NextRequest) {
  try {
    const ctx = getAdaptivePracticeContext();
    const session = await getAuthenticatedSession(req);
    if (!session) return NextResponse.json({ error: 'Unauthorized session' }, { status: 401 });

    const profiles = await ctx.getRetention.execute({ studentId: session.userId });
    return NextResponse.json(
      profiles.map((p) => ({
        id: p.id,
        studentId: p.studentId,
        competencyId: p.competencyId,
        lastReviewed: p.lastReviewed,
        retentionScore: p.retentionScore,
        reviewIntervalHours: p.reviewInterval,
        nextReviewDate: p.nextReviewDate,
        reviewPriority: p.reviewPriority,
      }))
    );
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}

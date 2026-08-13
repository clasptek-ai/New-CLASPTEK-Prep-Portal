export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getAdaptivePracticeContext } from '@/lib/adaptive-practice-context';
import { getAuthenticatedSession } from '@/lib/auth-util';

export async function GET(req: NextRequest) {
  try {
    const ctx = getAdaptivePracticeContext();
    const session = await getAuthenticatedSession(req);
    if (!session) return NextResponse.json({ error: 'Unauthorized session' }, { status: 401 });

    const analytics = await ctx.getAnalytics.execute({ studentId: session.userId });
    return NextResponse.json(
      analytics ?? {
        accuracyTrend: [75, 80, 85],
        speedTrend: [45, 42, 40],
        masteryTrend: [60, 68, 75],
        retentionTrend: [90, 88, 85],
        weakSkills: ['Grammar Precision', 'Data Analysis'],
        strongSkills: ['Main Idea Inference', 'Vocabulary in Context'],
        practiceFrequency: 4.2,
        consistencyScore: 85,
        totalStudyTimeMs: 3600000,
        totalQuestionsAnswered: 120,
        hintsUsed: 3,
        skippedQuestions: 2,
        bookmarkRate: 5.5,
      }
    );
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}

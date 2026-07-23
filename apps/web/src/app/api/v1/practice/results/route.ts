export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedSession } from '@/lib/auth-util';

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthenticatedSession(req);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('sessionId') || 'ses-prac-completed-1';

    return NextResponse.json({
      resultId: `res-${sessionId}`,
      sessionId,
      studentId: session.userId,
      overallScore: 85.0,
      maxScore: 100,
      accuracyPercentage: 85.0,
      timeTakenSeconds: 900,
      skillScores: [
        {
          skillId: 'sk-grammar-1',
          skillName: 'Grammar Accuracy',
          score: 85,
          maxScore: 100,
          percentage: 85.0,
        },
      ],
      practiceRecommendations: ['Grammar proficiency validated. Ready for Listening Practice.'],
      generatedAt: new Date().toISOString(),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

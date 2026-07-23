export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedSession } from '@/lib/auth-util';

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthenticatedSession(req);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('sessionId') || 'ses-active-001';

    return NextResponse.json({
      resultId: `res-${sessionId}`,
      sessionId,
      studentId: session.userId,
      overallScore: 82.5,
      maxScore: 100,
      isPassed: true,
      visibilityMode: 'FULL_REVIEW',
      sectionScores: [
        { sectionCode: 'LISTENING', score: 32, maxScore: 40, percentage: 80.0, passed: true },
        { sectionCode: 'READING', score: 34, maxScore: 40, percentage: 85.0, passed: true },
      ],
      generatedAt: new Date().toISOString(),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedSession } from '@/lib/auth-util';

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthenticatedSession(req);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    return NextResponse.json({
      studentId: session.userId,
      rawScore: 8.0,
      maxScore: 9.0,
      bandScore: '8.0',
      isCorrect: true,
      confidence: 0.95,
      rubricScores: [
        { criterionCode: 'CC', criterionName: 'Coherence and Cohesion', score: 8.0, maxScore: 9.0 },
      ],
      feedback: 'Excellent structuring and grammar usage.',
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

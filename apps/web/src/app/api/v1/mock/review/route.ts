export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedSession } from '@/lib/auth-util';

export async function POST(req: NextRequest) {
  try {
    const session = await getAuthenticatedSession(req);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const { sessionId, sectionIndex = 0 } = body;

    return NextResponse.json({
      sessionId,
      studentId: session.userId,
      sectionIndex,
      summary: {
        totalQuestions: 40,
        answeredCount: 38,
        flaggedCount: 3,
        unattemptedCount: 2,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

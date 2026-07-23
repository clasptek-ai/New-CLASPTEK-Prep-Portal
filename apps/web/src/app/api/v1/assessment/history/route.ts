export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedSession } from '@/lib/auth-util';

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthenticatedSession(req);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    return NextResponse.json({
      studentId: session.userId,
      history: [
        {
          attemptId: 'att-1',
          sessionId: 'ses-completed-1',
          assessmentTitle: 'IELTS Academic Diagnostic #1',
          overallScore: 82.5,
          isPassed: true,
          submittedAt: new Date(Date.now() - 86400000).toISOString(),
        },
      ],
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

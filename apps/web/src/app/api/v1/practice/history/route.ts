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
          sessionId: 'ses-prac-completed-1',
          title: 'IELTS Academic Grammar Practice',
          accuracyPercentage: 85.0,
          timeTakenSeconds: 900,
          completedAt: new Date(Date.now() - 43200000).toISOString(),
        },
      ],
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

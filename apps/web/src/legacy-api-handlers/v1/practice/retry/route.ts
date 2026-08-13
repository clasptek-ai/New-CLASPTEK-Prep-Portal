export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedSession } from '@/lib/auth-util';

export async function POST(req: NextRequest) {
  try {
    const session = await getAuthenticatedSession(req);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const { sessionId } = body;

    const newSessionId = `ses-retry-${Date.now()}`;

    return NextResponse.json(
      {
        sessionId: newSessionId,
        originalSessionId: sessionId,
        studentId: session.userId,
        status: 'STARTED',
        startedAt: new Date().toISOString(),
        message: 'Practice retry session initiated',
      },
      { status: 201 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedSession } from '@/lib/auth-util';
import { ProcessIntegrityEventHandler } from '@clasptek/application-mock-examination';

export async function POST(req: NextRequest) {
  try {
    const session = await getAuthenticatedSession(req);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const { sessionId, eventType, currentWarningCount = 0, details } = body;

    if (!sessionId || !eventType) {
      return NextResponse.json({ error: 'Missing sessionId or eventType' }, { status: 400 });
    }

    const handler = new ProcessIntegrityEventHandler();
    const result = await handler.execute({
      sessionId,
      studentId: session.userId,
      eventType,
      currentWarningCount,
      details,
    });

    return NextResponse.json({ success: true, ...result });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedSession } from '@/lib/auth-util';

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthenticatedSession(req);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    return NextResponse.json({
      hasActiveSession: true,
      sessionId: 'ses-active-001',
      studentId: session.userId,
      instanceId: 'inst-ielts-diag',
      status: 'IN_PROGRESS',
      remainingTimeSeconds: 5400,
      startedAt: new Date(Date.now() - 1800000).toISOString(),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

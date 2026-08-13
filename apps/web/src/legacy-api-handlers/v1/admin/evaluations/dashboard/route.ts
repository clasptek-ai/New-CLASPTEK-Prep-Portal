export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedSession } from '@/lib/auth-util';

const ADMIN_ROLES = ['ADMIN', 'SUPER_ADMIN', 'ADMINISTRATOR'];

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthenticatedSession(req);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const isAdmin = session.roles.some((r) => ADMIN_ROLES.includes(r));
    if (!isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    return NextResponse.json({
      pendingCount: 2,
      runningCount: 1,
      completedTodayCount: 45,
      failedCount: 0,
      averageQueueTimeSeconds: 15.5,
      averageEvaluationTimeSeconds: 32.2,
      throughputPerMinute: 1.4,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

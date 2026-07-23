export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedSession } from '@/lib/auth-util';

const ADMIN_ROLES = ['ADMIN', 'SUPER_ADMIN', 'ADMINISTRATOR', 'EXAMINER'];

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthenticatedSession(req);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const isAdmin = session.roles.some((r) => ADMIN_ROLES.includes(r));
    if (!isAdmin)
      return NextResponse.json(
        { error: 'Forbidden: requires ADMIN/EXAMINER role' },
        { status: 403 }
      );

    return NextResponse.json({
      totalDeliveredSessions: 1240,
      activeSessions: 14,
      timedOutSessions: 3,
      abandonedSessions: 2,
      pendingReviews: 5,
      overallPassRatePercentage: 78.4,
      practiceUnlockQueueLength: 8,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

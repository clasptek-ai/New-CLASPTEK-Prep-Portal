export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedSession } from '@/lib/auth-util';

const ADMIN_ROLES = ['ADMIN', 'SUPER_ADMIN', 'ADMINISTRATOR', 'INSTRUCTOR'];

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthenticatedSession(req);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const isAdmin = session.roles.some((r) => ADMIN_ROLES.includes(r));
    if (!isAdmin)
      return NextResponse.json(
        { error: 'Forbidden: requires ADMIN/INSTRUCTOR role' },
        { status: 403 }
      );

    return NextResponse.json({
      attempts: [
        {
          attemptId: 'att-prac-1',
          sessionId: 'ses-prac-1',
          studentId: 'std-101',
          attemptNumber: 1,
          status: 'SUBMITTED',
          startedAt: new Date(Date.now() - 3600000).toISOString(),
          completedAt: new Date().toISOString(),
        },
      ],
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

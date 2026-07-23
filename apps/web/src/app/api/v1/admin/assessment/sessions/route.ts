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
      activeSessionsCount: 14,
      sessions: [
        {
          sessionId: 'ses-active-001',
          studentId: 'std-101',
          assessmentTitle: 'IELTS Academic Diagnostic #1',
          status: 'IN_PROGRESS',
          remainingSeconds: 3600,
          startedAt: new Date(Date.now() - 1800000).toISOString(),
        },
      ],
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

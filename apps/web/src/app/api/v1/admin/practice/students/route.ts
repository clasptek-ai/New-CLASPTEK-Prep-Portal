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
      students: [
        {
          studentId: 'std-101',
          studentName: 'Alex Mercer',
          completedSessions: 12,
          averageScore: 82.5,
          currentStreak: 5,
          isMockReady: true,
        },
      ],
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

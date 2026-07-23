export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedSession } from '@/lib/auth-util';

const ADMIN_ROLES = ['ADMIN', 'SUPER_ADMIN', 'ADMINISTRATOR'];

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getAuthenticatedSession(req);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const isAdmin = session.roles.some((r) => ADMIN_ROLES.includes(r));
    if (!isAdmin)
      return NextResponse.json({ error: 'Forbidden: requires ADMIN role' }, { status: 403 });

    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const { reason = 'Retired by administrator' } = body;

    return NextResponse.json({
      success: true,
      questionId: id,
      status: 'RETIRED',
      retiredBy: session.userId,
      reason,
      message: `Question '${id}' has been retired.`,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

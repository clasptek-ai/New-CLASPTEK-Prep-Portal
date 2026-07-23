export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedSession } from '@/lib/auth-util';

const ADMIN_ROLES = ['ADMIN', 'SUPER_ADMIN', 'ADMINISTRATOR'];

export async function POST(req: NextRequest) {
  try {
    const session = await getAuthenticatedSession(req);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const isAdmin = session.roles.some((r) => ADMIN_ROLES.includes(r));
    if (!isAdmin)
      return NextResponse.json({ error: 'Forbidden: requires ADMIN role' }, { status: 403 });

    const body = await req.json();
    const { assessmentId } = body;

    if (!assessmentId) {
      return NextResponse.json({ error: 'Missing required field: assessmentId' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      assessmentId,
      status: 'PUBLISHED',
      publishedBy: session.userId,
      publishedAt: new Date().toISOString(),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

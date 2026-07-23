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
    const { code, title, examProductId, blueprintId } = body;

    if (!code || !title || !examProductId) {
      return NextResponse.json(
        { error: 'Missing required fields: code, title, examProductId' },
        { status: 400 }
      );
    }

    const id = `asm-${Date.now()}`;

    return NextResponse.json(
      {
        id,
        code,
        title,
        examProductId,
        blueprintId: blueprintId || null,
        status: 'DRAFT',
        createdBy: session.userId,
        createdAt: new Date().toISOString(),
      },
      { status: 201 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

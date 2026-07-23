export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedSession } from '@/lib/auth-util';

export async function POST(req: NextRequest) {
  try {
    const session = await getAuthenticatedSession(req);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const { instanceId = 'inst-default' } = body;

    const sessionId = `ses-${Date.now()}`;

    return NextResponse.json(
      {
        sessionId,
        studentId: session.userId,
        instanceId,
        status: 'STARTED',
        startedAt: new Date().toISOString(),
        message: 'Assessment session started successfully',
      },
      { status: 201 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

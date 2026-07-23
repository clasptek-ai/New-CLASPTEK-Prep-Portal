export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedSession } from '@/lib/auth-util';

export async function POST(req: NextRequest) {
  try {
    const session = await getAuthenticatedSession(req);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { sessionId, questionVersionId, payload } = body;

    if (!sessionId || !questionVersionId) {
      return NextResponse.json(
        { error: 'Missing required fields: sessionId, questionVersionId' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      sessionId,
      questionVersionId,
      recordedAt: new Date().toISOString(),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

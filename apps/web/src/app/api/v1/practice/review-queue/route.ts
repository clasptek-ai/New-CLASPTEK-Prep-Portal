export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedSession } from '@/lib/auth-util';

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthenticatedSession(req);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('sessionId') || 'ses-prac-completed-1';

    return NextResponse.json({
      sessionId,
      studentId: session.userId,
      items: [
        { questionId: 'q-101', isReviewed: false, orderIndex: 1 },
        { questionId: 'q-102', isReviewed: true, orderIndex: 2 },
      ],
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedSession } from '@/lib/auth-util';

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthenticatedSession(req);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const assessmentId = searchParams.get('assessmentId') || 'asm-sample';
    const mode = searchParams.get('mode') || 'DESKTOP';

    return NextResponse.json({
      assessmentId,
      mode,
      title: 'Sample IELTS Diagnostic Assessment',
      durationMinutes: 180,
      sections: [
        { name: 'Listening', questionCount: 40 },
        { name: 'Reading', questionCount: 40 },
        { name: 'Writing', questionCount: 2 },
        { name: 'Speaking', questionCount: 3 },
      ],
      previewRenderedAt: new Date().toISOString(),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

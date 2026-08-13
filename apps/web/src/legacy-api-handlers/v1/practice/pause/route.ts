export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getAdaptivePracticeContext } from '@/lib/adaptive-practice-context';

export async function POST(req: NextRequest) {
  try {
    const ctx = getAdaptivePracticeContext();
    const body = await req.json();
    const { sessionId, pausedAt } = body;
    if (!sessionId) return NextResponse.json({ error: 'Missing sessionId' }, { status: 400 });

    await ctx.pauseSession.execute({
      sessionId,
      pausedAt: pausedAt ? new Date(pausedAt) : undefined,
    });
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 400 }
    );
  }
}

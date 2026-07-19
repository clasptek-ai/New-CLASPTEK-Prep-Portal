import { NextRequest, NextResponse } from 'next/server';
import { getAssessmentRuntimeContext } from '@/lib/assessment-runtime-context';

export async function POST(req: NextRequest) {
  try {
    const ctx = getAssessmentRuntimeContext();
    const body = await req.json();
    const { sessionId, at } = body;
    if (!sessionId) return NextResponse.json({ error: 'Missing sessionId' }, { status: 400 });

    await ctx.startSession.execute({
      sessionId,
      at: at ? new Date(at) : undefined,
    });
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : String(err) }, { status: 400 });
  }
}

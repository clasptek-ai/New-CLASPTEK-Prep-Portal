export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getAssessmentRuntimeContext } from '@/lib/assessment-runtime-context';

export async function POST(req: NextRequest) {
  try {
    const ctx = getAssessmentRuntimeContext();
    const body = await req.json();
    const { sessionId, signature, serverId, submittedAt } = body;
    if (!sessionId || !signature || !serverId) {
      return NextResponse.json({ error: 'Missing required submission fields' }, { status: 400 });
    }

    await ctx.submitSession.execute({
      sessionId,
      signature,
      serverId,
      submittedAt: submittedAt ? new Date(submittedAt) : undefined,
    });
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 400 }
    );
  }
}

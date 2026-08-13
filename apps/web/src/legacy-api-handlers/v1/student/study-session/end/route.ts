export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getStudentLearningContext } from '@/lib/student-learning-context';

export async function POST(req: NextRequest) {
  try {
    const ctx = getStudentLearningContext();
    const body = await req.json();
    const { journeyId, sessionId, durationMs, completionReason } = body;
    if (!journeyId || !sessionId || durationMs === undefined) {
      return NextResponse.json(
        { error: 'journeyId, sessionId, durationMs are required' },
        { status: 400 }
      );
    }

    await ctx.endSession.execute({ journeyId, sessionId, durationMs, completionReason });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

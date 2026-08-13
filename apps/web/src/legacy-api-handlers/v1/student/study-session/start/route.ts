export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getStudentLearningContext } from '@/lib/student-learning-context';

export async function POST(req: NextRequest) {
  try {
    const ctx = getStudentLearningContext();
    const body = await req.json();
    const { journeyId, programmeId, deviceType, platform, ipHash, timezone } = body;
    if (!journeyId) return NextResponse.json({ error: 'journeyId required' }, { status: 400 });

    const sessionId = await ctx.startSession.execute({
      journeyId,
      programmeId,
      deviceType,
      platform,
      ipHash,
      timezone,
    });
    return NextResponse.json({ sessionId }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

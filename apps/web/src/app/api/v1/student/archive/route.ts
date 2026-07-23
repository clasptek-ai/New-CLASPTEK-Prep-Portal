export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getStudentLearningContext } from '@/lib/student-learning-context';

export async function POST(req: NextRequest) {
  try {
    const ctx = getStudentLearningContext();
    const body = await req.json();
    const { journeyId } = body;
    if (!journeyId) return NextResponse.json({ error: 'journeyId required' }, { status: 400 });

    await ctx.archiveJourney.execute({ journeyId });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

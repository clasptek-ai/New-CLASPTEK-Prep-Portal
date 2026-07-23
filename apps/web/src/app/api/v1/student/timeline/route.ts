export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getStudentLearningContext } from '@/lib/student-learning-context';

export async function GET(req: NextRequest) {
  try {
    const ctx = getStudentLearningContext();
    const journeyId = req.nextUrl.searchParams.get('journeyId');
    if (!journeyId) return NextResponse.json({ error: 'journeyId required' }, { status: 400 });

    const journey = await ctx.getJourney.execute({ journeyId });
    if (!journey) return NextResponse.json({ error: 'Journey not found' }, { status: 404 });

    // Return milestones sorted chronologically as a timeline
    const timeline = journey.milestones
      .filter((m) => m.completed)
      .sort((a, b) => (a.completedAt?.getTime() ?? 0) - (b.completedAt?.getTime() ?? 0))
      .map((m) => ({
        id: m.id,
        type: 'MILESTONE',
        title: m.title,
        milestoneType: m.milestoneType,
        occurredAt: m.completedAt,
      }));

    return NextResponse.json({ journeyId, timeline });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { getStudentLearningContext } from '@/lib/student-learning-context';

export async function GET(req: NextRequest) {
  try {
    const ctx = getStudentLearningContext();
    const journeyId = req.nextUrl.searchParams.get('journeyId');
    if (!journeyId) return NextResponse.json({ error: 'journeyId required' }, { status: 400 });

    const journey = await ctx.getJourney.execute({ journeyId });
    if (!journey) return NextResponse.json({ error: 'Journey not found' }, { status: 404 });

    return NextResponse.json(journey.achievements.map(a => ({
      id: a.id,
      achievementType: a.achievementType,
      definitionId: a.definitionId,
      unlockedAt: a.unlockedAt,
      payload: a.payload,
    })));
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

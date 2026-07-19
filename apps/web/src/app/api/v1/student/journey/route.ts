import { NextRequest, NextResponse } from 'next/server';
import { getStudentLearningContext } from '@/lib/student-learning-context';

import { getAuthenticatedSession } from '@/lib/auth-util';

export async function GET(req: NextRequest) {
  try {
    const ctx = getStudentLearningContext();
    const session = await getAuthenticatedSession(req);
    if (!session) return NextResponse.json({ error: 'Unauthorized session' }, { status: 401 });
    const studentId = session.userId;

    const journey = await ctx.getJourney.execute({ studentId });
    if (!journey) return NextResponse.json({ error: 'Journey not found' }, { status: 404 });

    return NextResponse.json({
      id: journey.id,
      studentId: journey.studentId,
      status: journey.status,
      streak: { current: journey.streak.current, longest: journey.streak.longest },
      consentGiven: journey.consentGiven,
      goalsCount: journey.goals.length,
      milestonesCount: journey.milestones.length,
      achievementsCount: journey.achievements.length,
      bookmarksCount: journey.bookmarks.length,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const ctx = getStudentLearningContext();
    const body = await req.json();
    const { studentId, activate } = body;
    if (!studentId) return NextResponse.json({ error: 'studentId is required' }, { status: 400 });

    const id = await ctx.createJourney.execute({ studentId });
    if (activate) await ctx.activateJourney.execute({ journeyId: id });

    return NextResponse.json({ id }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

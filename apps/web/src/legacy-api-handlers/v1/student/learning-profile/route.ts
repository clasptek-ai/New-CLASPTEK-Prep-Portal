export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getStudentLearningContext } from '@/lib/student-learning-context';
import { getAuthenticatedSession } from '@/lib/auth-util';

export async function GET(req: NextRequest) {
  try {
    const ctx = getStudentLearningContext();
    const session = await getAuthenticatedSession(req);
    if (!session) return NextResponse.json({ error: 'Unauthorized session' }, { status: 401 });

    const profile = await ctx.getProfile.execute({ studentId: session.userId });
    if (!profile) {
      return NextResponse.json({
        learningPace: 'Standard',
        weeklyStudyHours: 12,
        estimatedCompletionDate: null,
      });
    }

    return NextResponse.json({
      learningPace: profile.learningPace.value,
      weeklyStudyHours: profile.weeklyStudyHours,
      estimatedCompletionDate: profile.estimatedCompletionDate,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const ctx = getStudentLearningContext();
    const session = await getAuthenticatedSession(req);
    if (!session) return NextResponse.json({ error: 'Unauthorized session' }, { status: 401 });

    const body = await req.json();
    const { pace, weeklyStudyHours } = body;
    if (!pace) return NextResponse.json({ error: 'pace is required' }, { status: 400 });

    const profileId = await ctx.setLearningPace.execute({
      studentId: session.userId,
      pace,
      weeklyStudyHours,
    });

    return NextResponse.json({ profileId, pace, weeklyStudyHours });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

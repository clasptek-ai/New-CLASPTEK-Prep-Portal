export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getStudentLearningContext } from '@/lib/student-learning-context';
import { getAuthenticatedSession } from '@/lib/auth-util';

export async function GET(req: NextRequest) {
  try {
    const ctx = getStudentLearningContext();
    const session = await getAuthenticatedSession(req);
    if (!session) return NextResponse.json({ error: 'Unauthorized session' }, { status: 401 });

    const journey = await ctx.getJourney.execute({ studentId: session.userId });
    if (!journey)
      return NextResponse.json({ error: 'Learning journey not found' }, { status: 404 });

    const result = await ctx.getExamTarget.execute({
      journeyId: journey.id,
      studentId: session.userId,
    });

    if (!result)
      return NextResponse.json({ message: 'No target exam date configured' }, { status: 200 });

    return NextResponse.json(result);
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
    const { journeyId, programmeId, targetExamDate, targetScore, registrationStatus } = body;
    if (!journeyId || !programmeId || !targetExamDate) {
      return NextResponse.json(
        { error: 'journeyId, programmeId, and targetExamDate are required' },
        { status: 400 }
      );
    }

    await ctx.setTargetExamDate.execute({
      journeyId,
      programmeId,
      targetExamDate,
      targetScore,
      registrationStatus,
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

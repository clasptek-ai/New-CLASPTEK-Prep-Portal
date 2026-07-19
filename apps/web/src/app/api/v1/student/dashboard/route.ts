import { NextRequest, NextResponse } from 'next/server';
import { getStudentLearningContext } from '@/lib/student-learning-context';
import { getAuthenticatedSession } from '@/lib/auth-util';

export async function GET(req: NextRequest) {
  try {
    const ctx = getStudentLearningContext();
    const session = await getAuthenticatedSession(req);
    if (!session) return NextResponse.json({ error: 'Unauthorized session' }, { status: 401 });

    const studentId = req.nextUrl.searchParams.get('studentId');
    if (!studentId) return NextResponse.json({ error: 'studentId required' }, { status: 400 });

    const isSpecialRole = session.roles.includes('ADMINISTRATOR') || session.roles.includes('INSTRUCTOR');
    if (session.userId !== studentId && !isSpecialRole) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const projection = await ctx.getDashboard.execute({ studentId });
    if (!projection) return NextResponse.json({ error: 'Dashboard not found' }, { status: 404 });

    return NextResponse.json({
      journeyId: projection.journeyId,
      studentId: projection.studentId,
      activeProgrammeId: projection.activeProgrammeId,
      activeProgrammeName: projection.activeProgrammeName,
      overallProgress: projection.overallProgress,
      currentGoal: {
        id: projection.currentGoalId,
        title: projection.currentGoalTitle,
      },
      currentStreak: projection.currentStreak,
      nextMilestone: {
        id: projection.nextMilestoneId,
        title: projection.nextMilestoneTitle,
      },
      recommendations: projection.recommendationPayload,
      lastUpdated: projection.lastProjectedAt,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

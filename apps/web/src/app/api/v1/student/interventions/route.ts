export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getStudentLearningContext } from '@/lib/student-learning-context';
import { getAuthenticatedSession } from '@/lib/auth-util';

export async function GET(req: NextRequest) {
  try {
    const ctx = getStudentLearningContext();
    const session = await getAuthenticatedSession(req);
    if (!session) return NextResponse.json({ error: 'Unauthorized session' }, { status: 401 });

    const activeOnly = req.nextUrl.searchParams.get('activeOnly') !== 'false';
    const list = await ctx.getInterventions.execute({
      studentId: session.userId,
      activeOnly,
    });

    return NextResponse.json(
      list.map((item) => ({
        id: item.id,
        ruleCode: item.ruleCode,
        interventionType: item.intervention.interventionType,
        status: item.intervention.status,
        title: item.intervention.title,
        description: item.intervention.description,
        triggerReason: item.intervention.triggerReason,
        actionRecommended: item.intervention.actionRecommended,
        createdAt: item.intervention.createdAt,
      }))
    );
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const ctx = getStudentLearningContext();
    const session = await getAuthenticatedSession(req);
    if (!session) return NextResponse.json({ error: 'Unauthorized session' }, { status: 401 });

    const journey = await ctx.getJourney.execute({ studentId: session.userId });
    if (!journey)
      return NextResponse.json({ error: 'Learning journey not found' }, { status: 404 });

    const body = await req.json().catch(() => ({}));

    const interventions = await ctx.runInterventions.execute({
      journeyId: journey.id,
      studentId: session.userId,
      daysSinceLastLogin: body.daysSinceLastLogin,
      missedWeeklyTargets: body.missedWeeklyTargets,
      repeatedLessonFailures: body.repeatedLessonFailures,
      weakCompetenciesCount: body.weakCompetenciesCount,
      missedSessionsCount: body.missedSessionsCount,
      scoreTrend: body.scoreTrend,
    });

    return NextResponse.json({
      triggeredCount: interventions.length,
      interventions: interventions.map((i) => ({
        id: i.id,
        title: i.intervention.title,
        status: i.intervention.status,
      })),
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

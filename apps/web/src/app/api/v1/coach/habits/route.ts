import { NextRequest, NextResponse } from 'next/server';
import { getLearningCoachContext } from '@/lib/learning-coach-context';
import { HabitMood } from '@clasptek/domain-learning-coach';

/**
 * GET /api/v1/coach/habits?coachId=...
 * Retrieve habit summary and analytics.
 *
 * POST /api/v1/coach/habits
 * Record daily study habit check-in, or trigger habit analytics computation.
 * Body (Check-in): { coachId, date, studyMinutes, focusScore, mood, notes }
 * Body (Compute): { coachId, compute: true, periodType, periodStart }
 */

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const coachId = searchParams.get('coachId');

    if (!coachId) {
      return NextResponse.json({ error: 'Missing coachId parameter' }, { status: 400 });
    }

    const ctx = await getLearningCoachContext();
    const summary = await ctx.getHabitSummary.execute(coachId);

    if (!summary) {
      return NextResponse.json({ message: 'No habit analytics pre-computed yet', streak: 0, consistency: 0 });
    }

    return NextResponse.json({
      coachId: summary.coachId,
      periodType: summary.periodType,
      currentStreak: summary.currentStreak,
      longestStreak: summary.longestStreak,
      weeklyConsistency: summary.weeklyConsistency,
      monthlyConsistency: summary.monthlyConsistency,
      avgSessionMinutes: summary.avgSessionMinutes,
      computedAt: summary.computedAt
    });
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const ctx = await getLearningCoachContext();
    const body = await req.json();
    const { coachId, date, studyMinutes, focusScore, mood, notes, compute, periodType, periodStart } = body;

    if (!coachId) {
      return NextResponse.json({ error: 'Missing coachId parameter' }, { status: 400 });
    }

    if (compute === true) {
      if (!periodType || !periodStart) {
        return NextResponse.json({ error: 'Missing periodType or periodStart for computation' }, { status: 400 });
      }
      const analytics = await ctx.computeHabitAnalytics.execute({
        coachId,
        periodType,
        periodStart: new Date(periodStart)
      });
      return NextResponse.json({
        coachId: analytics.coachId,
        periodType: analytics.periodType,
        currentStreak: analytics.currentStreak,
        weeklyConsistency: analytics.weeklyConsistency,
        computedAt: analytics.computedAt
      }, { status: 201 });
    }

    if (!date || studyMinutes === undefined) {
      return NextResponse.json({ error: 'Missing date or studyMinutes' }, { status: 400 });
    }

    const tracker = await ctx.updateHabit.execute({
      coachId,
      date: new Date(date),
      studyMinutes: parseInt(studyMinutes),
      focusScore: focusScore !== undefined ? parseFloat(focusScore) : undefined,
      mood: mood as HabitMood | undefined,
      notes
    });

    return NextResponse.json({
      trackerId: tracker.id,
      coachId: tracker.coachId,
      habitDate: tracker.habitDate,
      studied: tracker.studied,
      studyMinutes: tracker.studyMinutes
    }, { status: 201 });
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
}

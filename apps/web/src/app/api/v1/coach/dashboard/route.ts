import { NextRequest, NextResponse } from 'next/server';
import { getLearningCoachContext } from '@/lib/learning-coach-context';

/**
 * GET /api/v1/coach/dashboard?coachId=...
 * Retrieve the coach dashboard projection view (cached/pre-computed).
 */

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const coachId = searchParams.get('coachId');

    if (!coachId) {
      return NextResponse.json({ error: 'Missing coachId parameter' }, { status: 400 });
    }

    const ctx = await getLearningCoachContext();
    const projection = await ctx.getCoachDashboard.execute(coachId);

    return NextResponse.json({
      coachId: projection.coachId,
      todayTasks: projection.todayTasks,
      goalSummary: projection.goalSummary,
      habitSummary: projection.habitSummary,
      latestMotivation: projection.latestMotivation,
      criticalInsights: projection.criticalInsights,
      predictionSummary: projection.predictionSummary,
      lastComputedAt: projection.lastComputedAt
    });
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
}

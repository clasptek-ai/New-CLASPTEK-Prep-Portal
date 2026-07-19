import { NextRequest, NextResponse } from 'next/server';
import { getLearningCoachContext } from '@/lib/learning-coach-context';

/**
 * PATCH /api/v1/coach/goals/{id}
 * Update progress or complete a goal.
 * Body: { newValue } or { complete: true }
 */

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: goalId } = await params;
    if (!goalId) {
      return NextResponse.json({ error: 'Missing goal ID' }, { status: 400 });
    }

    const ctx = await getLearningCoachContext();
    const body = await req.json();
    const { newValue, complete } = body;

    let goal;
    if (complete === true) {
      goal = await ctx.completeGoal.execute(goalId);
    } else if (newValue !== undefined) {
      goal = await ctx.updateGoalProgress.execute({ goalId, newValue: parseFloat(newValue) });
    } else {
      return NextResponse.json({ error: 'Provide newValue or complete: true' }, { status: 400 });
    }

    return NextResponse.json({
      goalId: goal.id,
      status: goal.status,
      currentValue: goal.currentValue,
      progressPercent: goal.progressPercent,
      completedAt: goal.completedAt
    });
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
}

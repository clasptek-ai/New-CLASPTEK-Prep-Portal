import { NextRequest, NextResponse } from 'next/server';
import { getLearningCoachContext } from '@/lib/learning-coach-context';
import { GoalType } from '@clasptek/domain-learning-coach';

/**
 * GET /api/v1/coach/goals?coachId=...&goalType=...
 * Retrieve study goals by type or status.
 *
 * POST /api/v1/coach/goals
 * Create a new study goal.
 * Body: { coachId, goalType, title, description, targetValue, targetUnit, deadline }
 */

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const coachId = searchParams.get('coachId');
    const goalType = searchParams.get('goalType') as GoalType | null;

    if (!coachId) {
      return NextResponse.json({ error: 'Missing coachId parameter' }, { status: 400 });
    }

    const ctx = await getLearningCoachContext();
    const goals = await ctx.getGoals.execute({
      coachId,
      goalType: goalType ?? undefined
    });

    return NextResponse.json({
      goals: goals.map(g => ({
        id: g.id,
        goalType: g.goalType,
        status: g.status,
        title: g.title,
        description: g.description,
        targetValue: g.target.targetValue,
        targetUnit: g.target.targetUnit,
        currentValue: g.currentValue,
        progressPercent: g.progressPercent,
        deadline: g.target.deadline,
        completedAt: g.completedAt
      }))
    });
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const ctx = await getLearningCoachContext();
    const body = await req.json();
    const { coachId, goalType, title, description, targetValue, targetUnit, deadline } = body;

    if (!coachId || !goalType || !title || targetValue === undefined || !targetUnit) {
      return NextResponse.json({ error: 'Missing required goal parameters' }, { status: 400 });
    }

    const goal = await ctx.createGoal.execute({
      coachId,
      goalType,
      title,
      description,
      targetValue: parseFloat(targetValue),
      targetUnit,
      deadline: deadline ? new Date(deadline) : undefined
    });

    return NextResponse.json({
      goalId: goal.id,
      goalType: goal.goalType,
      status: goal.status,
      title: goal.title,
      progressPercent: goal.progressPercent
    }, { status: 201 });
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
}

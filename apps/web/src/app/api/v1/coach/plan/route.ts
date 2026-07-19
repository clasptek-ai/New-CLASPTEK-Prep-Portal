import { NextRequest, NextResponse } from 'next/server';
import { getLearningCoachContext } from '@/lib/learning-coach-context';

/**
 * GET /api/v1/coach/plan?coachId=...
 * Retrieve today's daily study plan tasks.
 *
 * POST /api/v1/coach/plan
 * Generate a new daily study plan for a student.
 * Body: { coachId, studentId, profileId }
 */

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const coachId = searchParams.get('coachId');

    if (!coachId) {
      return NextResponse.json({ error: 'Missing coachId parameter' }, { status: 400 });
    }

    const ctx = await getLearningCoachContext();
    const plan = await ctx.getTodaysTasks.execute(coachId);

    if (!plan) {
      return NextResponse.json({ tasks: [], message: 'No study plan generated for today yet' });
    }

    return NextResponse.json({
      planId: plan.id,
      coachId: plan.coachId,
      planDate: plan.planDate,
      status: plan.status,
      totalMinutes: plan.totalMinutes,
      completedMinutes: plan.completedMinutes,
      completionRate: plan.completionRate,
      tasks: plan.tasks.map(t => ({
        id: t.id,
        taskType: t.taskType,
        title: t.title,
        estimatedMinutes: t.estimatedMinutes,
        priority: t.priority,
        status: t.status,
        completedAt: t.completedAt
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
    const { coachId, studentId, profileId } = body;

    if (!coachId || !studentId || !profileId) {
      return NextResponse.json({ error: 'Missing coachId, studentId, or profileId' }, { status: 400 });
    }

    const plan = await ctx.generateStudyPlan.execute({ coachId, studentId, profileId });

    return NextResponse.json({
      planId: plan.id,
      coachId: plan.coachId,
      planDate: plan.planDate,
      status: plan.status,
      totalMinutes: plan.totalMinutes,
      tasksCount: plan.tasks.length
    }, { status: 201 });
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
}

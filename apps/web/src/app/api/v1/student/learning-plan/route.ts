import { NextRequest, NextResponse } from 'next/server';
import { getStudentLearningContext } from '@/lib/student-learning-context';

export async function GET(req: NextRequest) {
  try {
    const ctx = getStudentLearningContext();
    const journeyId = req.nextUrl.searchParams.get('journeyId');
    if (!journeyId) return NextResponse.json({ error: 'journeyId required' }, { status: 400 });

    const plan = await ctx.getLearningPlan.execute({ journeyId });
    if (!plan) return NextResponse.json({ error: 'No active learning plan found' }, { status: 404 });

    return NextResponse.json({
      id: plan.id,
      title: plan.title,
      status: plan.status,
      currentVersion: plan.currentVersion ? {
        versionNo: plan.currentVersion.versionNo,
        source: plan.currentVersion.source,
        goals: plan.currentVersion.goals,
        schedule: plan.currentVersion.schedule,
        notes: plan.currentVersion.notes,
        createdAt: plan.currentVersion.createdAt,
      } : null,
      versionCount: plan.versions.length,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const ctx = getStudentLearningContext();
    const body = await req.json();
    const { journeyId, studentId, title, versionSource, goals, schedule, notes } = body;
    if (!journeyId || !studentId) {
      return NextResponse.json({ error: 'journeyId and studentId required' }, { status: 400 });
    }

    const id = await ctx.createPlan.execute({
      journeyId, studentId, title,
      versionSource: versionSource ?? 'STUDENT',
      goals, schedule, notes,
    });
    return NextResponse.json({ id }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

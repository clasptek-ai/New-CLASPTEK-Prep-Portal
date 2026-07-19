import { NextRequest, NextResponse } from 'next/server';
import { getStudentLearningContext } from '@/lib/student-learning-context';
import type { GoalPriority } from '@clasptek/domain-student-learning';

export async function GET(req: NextRequest) {
  try {
    const ctx = getStudentLearningContext();
    const journeyId = req.nextUrl.searchParams.get('journeyId');
    if (!journeyId) return NextResponse.json({ error: 'journeyId required' }, { status: 400 });

    const journey = await ctx.getJourney.execute({ journeyId });
    if (!journey) return NextResponse.json({ error: 'Journey not found' }, { status: 404 });

    return NextResponse.json(journey.goals.map(g => ({
      id: g.id,
      title: g.title,
      description: g.description,
      priority: g.priority,
      status: g.status,
      targetDate: g.targetDate,
      completedAt: g.completedAt,
    })));
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const ctx = getStudentLearningContext();
    const body = await req.json();
    const { journeyId, title, priority, programmeId, description, targetDate } = body;
    if (!journeyId || !title) {
      return NextResponse.json({ error: 'journeyId and title are required' }, { status: 400 });
    }

    const id = await ctx.createGoal.execute({
      journeyId,
      title,
      priority: (priority ?? 'MEDIUM') as GoalPriority,
      programmeId,
      description,
      targetDate: targetDate ? new Date(targetDate) : undefined,
    });
    return NextResponse.json({ id }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

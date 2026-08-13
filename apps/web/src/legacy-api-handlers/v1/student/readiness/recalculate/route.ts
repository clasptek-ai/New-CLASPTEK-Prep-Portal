export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getStudentLearningContext } from '@/lib/student-learning-context';
import { getAuthenticatedSession } from '@/lib/auth-util';

export async function POST(req: NextRequest) {
  try {
    const ctx = getStudentLearningContext();
    const session = await getAuthenticatedSession(req);
    if (!session) return NextResponse.json({ error: 'Unauthorized session' }, { status: 401 });

    const journey = await ctx.getJourney.execute({ studentId: session.userId });
    if (!journey)
      return NextResponse.json({ error: 'Learning journey not found' }, { status: 404 });

    const body = await req.json().catch(() => ({}));

    const result = await ctx.calculateReadiness.execute({
      journeyId: journey.id,
      studentId: session.userId,
      diagnosticPerformance: body.diagnosticPerformance,
      practiceScores: body.practiceScores,
      mockScores: body.mockScores,
      curriculumCompletion: body.curriculumCompletion,
      lessonConsistency: body.lessonConsistency,
      weakSkillAreasCount: body.weakSkillAreasCount,
    });

    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

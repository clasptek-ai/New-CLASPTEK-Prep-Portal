import { NextRequest, NextResponse } from 'next/server';
import { getLearningCoachContext } from '@/lib/learning-coach-context';

/**
 * GET /api/v1/coach?coachId=...
 * Retrieve a learning coach profile by coach ID.
 *
 * POST /api/v1/coach
 * Create a new learning coach profile for a student.
 * Body: { studentId, profileId }
 */

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const coachId = searchParams.get('coachId');

    if (!coachId) {
      return NextResponse.json({ error: 'Missing coachId parameter' }, { status: 400 });
    }

    const ctx = await getLearningCoachContext();
    const result = await ctx.getCoach.execute(coachId);

    return NextResponse.json({
      coach: {
        id: result.coach.id,
        studentId: result.coach.studentId,
        profileId: result.coach.profileId,
        status: result.coach.status,
        createdAt: result.coach.createdAt
      },
      brain: result.brain ? {
        id: result.brain.id,
        style: result.brain.style,
        activeEngine: result.brain.activeEngine,
        promptVersion: result.brain.promptVersion
      } : null,
      memory: result.memory ? {
        id: result.memory.id,
        preferredStudyHours: result.memory.preferredStudyHours,
        preferredLearningStyle: result.memory.preferredLearningStyle,
        preferredMotivationStyle: result.memory.preferredMotivationStyle,
        recurringMistakes: result.memory.recurringMistakes
      } : null
    });
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const ctx = await getLearningCoachContext();
    const body = await req.json();
    const { studentId, profileId } = body;

    if (!studentId || !profileId) {
      return NextResponse.json({ error: 'Missing studentId or profileId' }, { status: 400 });
    }

    const { coach, brain } = await ctx.createCoach.execute({ studentId, profileId });

    return NextResponse.json({
      coachId: coach.id,
      studentId: coach.studentId,
      profileId: coach.profileId,
      status: coach.status,
      brainId: brain.id
    }, { status: 201 });
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
}

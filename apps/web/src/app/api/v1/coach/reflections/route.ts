import { NextRequest, NextResponse } from 'next/server';
import { getLearningCoachContext } from '@/lib/learning-coach-context';
import { ReflectionMood } from '@clasptek/domain-learning-coach';

/**
 * GET /api/v1/coach/reflections?coachId=...
 * Retrieve student reflection journals.
 *
 * POST /api/v1/coach/reflections
 * Record a new student reflection journal entry.
 * Body: { coachId, mood, difficultyRating, insights, whatWentWell, whatWasDifficult, nextSessionFocus, sessionId }
 */

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const coachId = searchParams.get('coachId');

    if (!coachId) {
      return NextResponse.json({ error: 'Missing coachId parameter' }, { status: 400 });
    }

    const ctx = await getLearningCoachContext();
    const history = await ctx.getReflectionHistory.execute(coachId);

    return NextResponse.json({
      reflections: history.map(r => ({
        id: r.id,
        coachId: r.coachId,
        sessionId: r.sessionId,
        mood: r.entry.mood,
        difficultyRating: r.entry.difficultyRating,
        insights: r.entry.insights,
        whatWentWell: r.entry.whatWentWell,
        whatWasDifficult: r.entry.whatWasDifficult,
        nextSessionFocus: r.entry.nextSessionFocus,
        recordedAt: r.recordedAt
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
    const { coachId, mood, difficultyRating, insights, whatWentWell, whatWasDifficult, nextSessionFocus, sessionId } = body;

    if (!coachId || !mood || difficultyRating === undefined) {
      return NextResponse.json({ error: 'Missing coachId, mood, or difficultyRating' }, { status: 400 });
    }

    const journal = await ctx.recordReflection.execute({
      coachId,
      mood: mood as ReflectionMood,
      difficultyRating: parseInt(difficultyRating),
      insights,
      whatWentWell,
      whatWasDifficult,
      nextSessionFocus,
      sessionId
    });

    return NextResponse.json({
      journalId: journal.id,
      coachId: journal.coachId,
      mood: journal.entry.mood,
      recordedAt: journal.recordedAt
    }, { status: 201 });
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
}

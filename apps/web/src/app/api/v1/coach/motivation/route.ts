import { NextRequest, NextResponse } from 'next/server';
import { getLearningCoachContext } from '@/lib/learning-coach-context';
import { InsightSeverity } from '@clasptek/domain-learning-coach';

/**
 * POST /api/v1/coach/motivation
 * Generate motivational or risk advice message.
 * Body: { coachId, studentId, profileId, type, severity, achievement }
 */

export async function POST(req: NextRequest) {
  try {
    const ctx = await getLearningCoachContext();
    const body = await req.json();
    const { coachId, studentId, profileId, type, severity, achievement } = body;

    if (!coachId || !studentId || !profileId || !type) {
      return NextResponse.json({ error: 'Missing coachId, studentId, profileId, or type' }, { status: 400 });
    }

    const msg = await ctx.generateMotivation.execute({
      coachId,
      studentId,
      profileId,
      type,
      severity: severity as InsightSeverity | undefined,
      achievement
    });

    return NextResponse.json({
      messageType: msg.messageType,
      content: msg.content,
      urgency: msg.urgency
    }, { status: 201 });
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
}

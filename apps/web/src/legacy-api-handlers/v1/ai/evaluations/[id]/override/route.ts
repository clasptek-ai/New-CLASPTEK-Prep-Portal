export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getAiEvaluationContext } from '@/lib/ai-evaluation-context';
import { getAuthenticatedSession } from '@/lib/auth-util';

const MODERATOR_ROLES = ['ADMIN', 'SUPER_ADMIN', 'ADMINISTRATOR', 'EXAMINER'];

/**
 * PATCH /api/v1/ai/evaluations/[id]/override
 *
 * Override the AI-assigned score for an evaluation.
 * Requires ADMIN, SUPER_ADMIN, ADMINISTRATOR, or EXAMINER role.
 *
 * Body: {
 *   overrideScore: number,          // new score (0-100)
 *   overrideReason: string,         // mandatory justification
 *   overrideFeedback?: string       // optional student-facing feedback
 * }
 */
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getAuthenticatedSession(req);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const isModerator = session.roles.some((r) => MODERATOR_ROLES.includes(r));
    if (!isModerator) {
      return NextResponse.json(
        { error: 'Forbidden: requires ADMIN, SUPER_ADMIN, or EXAMINER role' },
        { status: 403 }
      );
    }

    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: 'Missing evaluation id' }, { status: 400 });
    }

    const body = await req.json();
    const { overrideScore, overrideReason, overrideFeedback } = body;

    if (overrideScore === undefined || overrideScore === null) {
      return NextResponse.json({ error: 'Missing required field: overrideScore' }, { status: 400 });
    }

    if (typeof overrideScore !== 'number' || overrideScore < 0 || overrideScore > 100) {
      return NextResponse.json(
        { error: 'overrideScore must be a number between 0 and 100' },
        { status: 400 }
      );
    }

    if (!overrideReason || String(overrideReason).trim().length < 10) {
      return NextResponse.json(
        { error: 'overrideReason is required and must be at least 10 characters' },
        { status: 400 }
      );
    }

    const ctx = getAiEvaluationContext();

    const result = await ctx.overrideScore.execute({
      reviewId: id,
      overriddenBy: session.userId,
      overrideScore,
      rationale: String(overrideReason).trim(),
    });

    return NextResponse.json({
      success: true,
      jobId: id,
      overriddenBy: session.userId,
      overrideScore,
      message: 'Score override applied successfully',
      result,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

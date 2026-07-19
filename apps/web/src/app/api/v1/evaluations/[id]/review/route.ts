import { NextRequest, NextResponse } from 'next/server';
import { getAiEvaluationContext } from '@/lib/ai-evaluation-context';

/**
 * POST /api/v1/evaluations/[id]/review
 * Request human review for an evaluation job (admin only).
 * Body: { resultId, reason, reviewerId? }
 *
 * PATCH /api/v1/evaluations/[id]/review
 * Override a score or add a review comment.
 * Body: { reviewId, criterionCode?, overrideScore, rationale, overriddenBy }
 */

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const ctx = getAiEvaluationContext();
    const role = req.headers.get('x-role');
    if (!role || !['admin', 'reviewer'].includes(role)) {
      return NextResponse.json({ error: 'Admin or reviewer access required' }, { status: 403 });
    }

    const body = await req.json();
    const { resultId, reason, reviewerId } = body;

    if (!resultId || !reason) {
      return NextResponse.json({ error: 'Missing required fields: resultId, reason' }, { status: 400 });
    }

    const reviewId = await ctx.requestReview.execute({
      jobId: id,
      resultId,
      reason,
      reviewerId,
    });

    return NextResponse.json({ reviewId }, { status: 201 });
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : String(err) }, { status: 400 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await params to satisfy Next.js 15 Route Context type checking
    await params;
    const ctx = getAiEvaluationContext();
    const role = req.headers.get('x-role');
    const reviewerId = req.headers.get('x-reviewer-id');
    if (!role || !['admin', 'reviewer'].includes(role)) {
      return NextResponse.json({ error: 'Admin or reviewer access required' }, { status: 403 });
    }

    const body = await req.json();
    const { reviewId, criterionCode, overrideScore, rationale } = body;

    if (!reviewId || overrideScore === undefined || !rationale) {
      return NextResponse.json({ error: 'Missing required fields: reviewId, overrideScore, rationale' }, { status: 400 });
    }

    await ctx.overrideScore.execute({
      reviewId,
      criterionCode,
      overrideScore,
      rationale,
      overriddenBy: reviewerId ?? role,
    });

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : String(err) }, { status: 400 });
  }
}

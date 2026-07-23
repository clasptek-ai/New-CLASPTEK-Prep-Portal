export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getAiEvaluationContext } from '@/lib/ai-evaluation-context';
import { getAuthenticatedSession } from '@/lib/auth-util';

const MODERATOR_ROLES = ['ADMIN', 'SUPER_ADMIN', 'ADMINISTRATOR', 'EXAMINER'];

/**
 * PATCH /api/v1/ai/evaluations/[id]/approve
 *
 * Approve an AI evaluation — transitions job from COMPLETED → APPROVED.
 * Requires ADMIN, SUPER_ADMIN, ADMINISTRATOR, or EXAMINER role.
 *
 * Body: { reviewerId?: string, reviewNotes?: string }
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

    const body = await req.json().catch(() => ({}));
    const { reviewNotes } = body;

    const ctx = getAiEvaluationContext();

    const result = await ctx.approveEvaluation.execute({
      jobId: id,
      approvedBy: session.userId,
      comments: reviewNotes ? [{ commentText: reviewNotes }] : undefined,
    });

    return NextResponse.json({
      success: true,
      jobId: id,
      approvedBy: session.userId,
      message: 'Evaluation approved successfully',
      result,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

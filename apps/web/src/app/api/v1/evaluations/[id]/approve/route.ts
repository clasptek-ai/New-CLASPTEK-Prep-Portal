import { NextRequest, NextResponse } from 'next/server';
import { getAiEvaluationContext } from '@/lib/ai-evaluation-context';

/**
 * POST /api/v1/evaluations/[id]/approve
 * Approve a completed evaluation job (admin/reviewer only).
 * Body: { approvedBy, reviewId?, comments? }
 *
 * POST /api/v1/evaluations/[id]/publish
 * Publish an approved evaluation result (admin only).
 * Body: { reviewId? }
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

    const { searchParams } = new URL(req.url);
    const action = searchParams.get('action');

    const body = await req.json();

    if (action === 'publish') {
      if (role !== 'admin') return NextResponse.json({ error: 'Admin access required for publish' }, { status: 403 });
      await ctx.publishEvaluation.execute({ jobId: id, reviewId: body.reviewId });
      return NextResponse.json({ success: true, action: 'published' });
    }

    // Default action: approve
    await ctx.approveEvaluation.execute({
      jobId: id,
      reviewId: body.reviewId,
      approvedBy: body.approvedBy ?? role,
      comments: body.comments,
    });

    return NextResponse.json({ success: true, action: 'approved' });
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : String(err) }, { status: 400 });
  }
}

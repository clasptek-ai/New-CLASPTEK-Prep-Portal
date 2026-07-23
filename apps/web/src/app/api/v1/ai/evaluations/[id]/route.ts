export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getAiEvaluationContext } from '@/lib/ai-evaluation-context';
import { getAuthenticatedSession } from '@/lib/auth-util';

const ADMIN_ROLES = ['ADMIN', 'SUPER_ADMIN', 'ADMINISTRATOR', 'EXAMINER', 'INSTRUCTOR'];

/**
 * GET /api/v1/ai/evaluations/[id]
 *
 * Retrieve a single evaluation job by ID.
 * STUDENT can only access their own evaluations.
 * ADMIN / SUPER_ADMIN / EXAMINER / INSTRUCTOR can access all.
 */
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getAuthenticatedSession(req);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: 'Missing evaluation id' }, { status: 400 });
    }

    const ctx = getAiEvaluationContext();
    const evaluation = await ctx.getEvaluation.execute({ jobId: id });

    if (!evaluation) {
      return NextResponse.json({ error: 'Evaluation not found' }, { status: 404 });
    }

    // Students may only view their own evaluations
    const isPrivileged = session.roles.some((r) => ADMIN_ROLES.includes(r));
    if (!isPrivileged && evaluation.studentId !== session.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json({ evaluation });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getAiEvaluationContext } from '@/lib/ai-evaluation-context';
import { getAuthenticatedSession } from '@/lib/auth-util';

/**
 * GET /api/v1/evaluations/[id]
 * Fetch evaluation result by job ID or result ID.
 */

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const ctx = getAiEvaluationContext();
    const session = await getAuthenticatedSession(req);
    if (!session) return NextResponse.json({ error: 'Unauthorized session' }, { status: 401 });
    const studentId = session.userId;

    const { searchParams } = new URL(req.url);
    const byResult = searchParams.get('type') === 'result';

    const result = await ctx.getEvaluation.execute(byResult ? { resultId: id } : { jobId: id });
    if (!result) return NextResponse.json({ error: 'Evaluation not found' }, { status: 404 });

    // Enforce student-scoped access
    if (result.studentId !== studentId && !session.roles.includes('ADMINISTRATOR')) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    return NextResponse.json({
      id: result.id,
      jobId: result.jobId,
      studentId: result.studentId,
      questionType: result.questionType,
      rawScore: result.rawScore,
      maxScore: result.maxScore,
      bandScore: result.bandScore?.band,
      scorePercentage: result.scorePercentage,
      isCorrect: result.isCorrect,
      confidence: result.confidence?.value,
      isPublished: result.isPublished,
      createdAt: result.createdAt,
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getResultsContext } from '@/lib/results-context';
import { getAuthenticatedSession } from '@/lib/auth-util';
import { StudentResult } from '@clasptek/domain-results';

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthenticatedSession(req);
    if (!session) return NextResponse.json({ error: 'Unauthorized session' }, { status: 401 });

    const ctx = getResultsContext();
    const { searchParams } = new URL(req.url);

    const resultType = searchParams.get('resultType') ?? undefined;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : undefined;
    const offset = searchParams.get('offset')
      ? parseInt(searchParams.get('offset')!, 10)
      : undefined;

    const results = await ctx.getStudentResults.execute({
      studentId: session.userId,
      resultType,
      limit,
      offset,
    });

    return NextResponse.json({
      data: results.map((r: StudentResult) => ({
        id: r.id,
        studentId: r.studentId,
        resultType: r.resultType.type,
        sourceId: r.sourceId,
        title: r.title,
        score: r.score?.value,
        maxScore: r.score?.maxScore,
        percentage: r.score?.percentage,
        bandScore: r.bandScore,
        isPassing: r.isPassing,
        summaryFeedback: r.summaryFeedback,
        details: r.details,
        publishedAt: r.publishedAt.toISOString(),
      })),
      count: results.length,
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}

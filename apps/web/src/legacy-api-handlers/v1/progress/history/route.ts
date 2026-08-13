export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getResultsContext } from '@/lib/results-context';
import { getAuthenticatedSession } from '@/lib/auth-util';

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthenticatedSession(req);
    if (!session) return NextResponse.json({ error: 'Unauthorized session' }, { status: 401 });

    const ctx = getResultsContext();
    const { searchParams } = new URL(req.url);
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : 50;

    const history = await ctx.getPerformanceHistory.execute({
      studentId: session.userId,
      limit,
    });

    return NextResponse.json({
      history: history.map((h) => ({
        id: h.id,
        title: h.title,
        type: h.resultType.type,
        score: h.score?.value,
        percentage: h.score?.percentage,
        bandScore: h.bandScore,
        publishedAt: h.publishedAt.toISOString(),
      })),
      count: history.length,
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}

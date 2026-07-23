export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getResultsContext } from '@/lib/results-context';
import { getAuthenticatedSession } from '@/lib/auth-util';
import { StudentResult } from '@clasptek/domain-results';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ studentId: string }> }
) {
  try {
    const { studentId: targetStudentId } = await params;
    const session = await getAuthenticatedSession(req);
    if (!session) return NextResponse.json({ error: 'Unauthorized session' }, { status: 401 });

    const isAdmin = session.roles.includes('admin') || session.roles.includes('ADMINISTRATOR');
    if (session.userId !== targetStudentId && !isAdmin) {
      return NextResponse.json({ error: 'Forbidden access' }, { status: 403 });
    }

    const ctx = getResultsContext();
    const { searchParams } = new URL(req.url);

    const resultType = searchParams.get('resultType') ?? undefined;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : undefined;

    const results = await ctx.getStudentResults.execute({
      studentId: targetStudentId,
      resultType,
      limit,
    });

    return NextResponse.json({
      studentId: targetStudentId,
      results: results.map((r: StudentResult) => ({
        id: r.id,
        resultType: r.resultType.type,
        sourceId: r.sourceId,
        title: r.title,
        score: r.score?.value,
        maxScore: r.score?.maxScore,
        percentage: r.score?.percentage,
        bandScore: r.bandScore,
        publishedAt: r.publishedAt.toISOString(),
      })),
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}

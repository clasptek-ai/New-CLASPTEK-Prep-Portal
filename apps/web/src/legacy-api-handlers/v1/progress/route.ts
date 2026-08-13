export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getResultsContext } from '@/lib/results-context';
import { getAuthenticatedSession } from '@/lib/auth-util';

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthenticatedSession(req);
    if (!session) return NextResponse.json({ error: 'Unauthorized session' }, { status: 401 });

    const ctx = getResultsContext();
    const progressView = await ctx.getProgress.execute({ studentId: session.userId });

    return NextResponse.json({
      summary: progressView.summary
        ? {
            id: progressView.summary.id,
            studentId: progressView.summary.studentId,
            overallScore: progressView.summary.overallScore,
            academicStatus: progressView.summary.academicStatus.status,
            performanceTrend: progressView.summary.performanceTrend.trend,
            totalAssessments: progressView.summary.totalAssessments,
            totalPractices: progressView.summary.totalPractices,
            totalMocks: progressView.summary.totalMocks,
            totalEvaluations: progressView.summary.totalEvaluations,
            averageBandScore: progressView.summary.averageBandScore,
            strongestSkills: progressView.summary.strongestSkills,
            weakestSkills: progressView.summary.weakestSkills,
            lastCalculatedAt: progressView.summary.lastCalculatedAt.toISOString(),
          }
        : null,
      records: progressView.records.map((rec) => ({
        id: rec.id,
        skillCode: rec.skillCode,
        latestScore: rec.latestScore,
        bestScore: rec.bestScore,
        averageScore: rec.averageScore,
        attemptCount: rec.attemptCount,
        improvementRate: rec.improvementRate,
        lastActivityAt: rec.lastActivityAt.toISOString(),
      })),
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}

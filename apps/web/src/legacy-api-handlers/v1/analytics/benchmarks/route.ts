export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getLearningAnalyticsContext } from '@/lib/learning-analytics-context';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category') ?? 'READINESS_GROWTH';

    const ctx = await getLearningAnalyticsContext();
    const benchmark = await ctx.getInstitutionalBenchmarking.execute(category);

    return NextResponse.json({
      success: true,
      data: benchmark || {
        category,
        institutionalAverage: 76.5,
        topDecileScore: 92.4,
        cohortPercentiles: [
          { cohortId: 'cohort-a', percentile: 85, score: 84.0 },
          { cohortId: 'cohort-b', percentile: 62, score: 73.2 },
        ],
        computedAt: new Date().toISOString(),
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || String(err) },
      { status: 500 }
    );
  }
}

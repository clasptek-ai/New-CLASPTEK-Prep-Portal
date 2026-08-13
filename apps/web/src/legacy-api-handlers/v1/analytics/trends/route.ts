export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getLearningAnalyticsContext } from '@/lib/learning-analytics-context';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category') || 'StudyMinutes';

    const ctx = await getLearningAnalyticsContext();
    let trend = await ctx.getLearningTrend.execute(category);

    if (!trend) {
      trend = await ctx.generateTrendAnalysis.execute({
        category: 'PLATFORM',
        targetId: category,
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        endDate: new Date(),
      });
    }

    return NextResponse.json(trend);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { getLearningAnalyticsContext } from '@/lib/learning-analytics-context';

export async function GET(_req: NextRequest) {
  try {
    const ctx = await getLearningAnalyticsContext();
    const metrics = await ctx.getPlatformMetrics.execute();

    return NextResponse.json(metrics);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 });
  }
}
